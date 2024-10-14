/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { getWorkOrderById } from '~/server/queries/workOrder/queries';
import { getColumnTasksByWorkOrderId } from '~/server/queries/columnsWorkOrder/queries';
import { getTasksByWorkOrderId } from '~/server/queries/workTask/queries';
import { getMachineryById } from '~/server/queries/machinery/queries';
import { getUserById } from '~/server/queries/user/queries';
import { getEmployeeById } from '~/server/queries/employee/queries';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    // Fetch work order data
    const workOrder = await getWorkOrderById(orderId);
    if (!workOrder) throw new Error('Work order not found');

    let columns = await getColumnTasksByWorkOrderId(orderId);
    if (!columns) {
      columns = [];
    }
    // Order the columns by their position
    columns.sort((a, b) => a.position - b.position);

    let tasks = await getTasksByWorkOrderId(orderId);
    if (!tasks) {
      tasks = [];
    }
    // Order the tasks by their position
    tasks.sort((a, b) => a.position - b.position);

    const machinery = await getMachineryById(workOrder.machine_id);
    if (!machinery) throw new Error('Machinery not found');

    const user = await getUserById(workOrder.assigned_user);
    if (!user) throw new Error('User not found');

    // Create a new workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Work Order Report');

    // Format dates
    const formatDate = (date: Date | null) => (date ? date.toLocaleDateString() : 'N/A');

    // Set up initial row index
    let rowIndex = 1;

    // Add Work Order Details
    worksheet.mergeCells(`A${rowIndex}:E${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = 'Work Order Details';
    worksheet.getCell(`A${rowIndex}`).font = { bold: true, size: 16 };
    rowIndex += 2;

    const workOrderData = [
      { field: 'Order ID', value: workOrder.order_id.toString() },
      { field: 'Name', value: workOrder.name },
      {
        field: 'Machine',
        value: `${machinery.brand} ${machinery.model} (${machinery.serial_number})`,
      },
      { field: 'Assigned User', value: `${user.first_name} ${user.last_name}` },
      { field: 'Start Date', value: formatDate(workOrder.start_date) },
      { field: 'End Date', value: formatDate(workOrder.end_date) },
      {
        field: 'Status',
        value: workOrder.state === 1 ? 'Active' : workOrder.state === 0 ? 'On Hold' : 'Completed',
      },
    ];

    for (const item of workOrderData) {
      worksheet.getCell(`A${rowIndex}`).value = item.field;
      worksheet.getCell(`A${rowIndex}`).font = { bold: true };
      worksheet.getCell(`B${rowIndex}`).value = item.value;
      rowIndex++;
    }

    rowIndex += 2; // Add some space before the next section

    // Add Columns and Tasks
    worksheet.mergeCells(`A${rowIndex}:E${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = 'Columns and Tasks';
    worksheet.getCell(`A${rowIndex}`).font = { bold: true, size: 16 };
    rowIndex += 1;

    // Define table headers
    worksheet.getCell(`A${rowIndex}`).value = 'Column Title';
    worksheet.getCell(`B${rowIndex}`).value = 'Task Title';
    worksheet.getCell(`C${rowIndex}`).value = 'Assigned To';
    worksheet.getCell(`D${rowIndex}`).value = 'Priority';
    worksheet.getCell(`E${rowIndex}`).value = 'Status';

    // Style header
    for (let col = 1; col <= 5; col++) {
      const cell = worksheet.getCell(rowIndex, col);
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFC425' }, // Light yellow background
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
    rowIndex++;

    // Collect employee IDs to fetch employee details later
    const employeeIds = new Set<number>();

    // Add data to the worksheet
    for (const column of columns) {
      if (column.state === 0) {
        continue; // Skip inactive columns
      }

      const columnTasks = tasks.filter((task) => task.column_id === column.column_id);

      if (columnTasks.length === 0) {
        // If there are no tasks in the column, add the column title with empty task fields
        worksheet.getCell(`A${rowIndex}`).value = column.title;
        rowIndex++;
      } else {
        for (const task of columnTasks) {
          if (task.state === 0) {
            continue; // Skip inactive tasks
          }

          if (task.assigned_to) {
            employeeIds.add(task.assigned_to);
          }

          const employee = task.assigned_to ? await getEmployeeById(task.assigned_to) : null;
          const assignedTo = employee ? `${employee.firstName} ${employee.lastName}` : 'Unassigned';

          worksheet.getCell(`A${rowIndex}`).value = column.title;
          worksheet.getCell(`B${rowIndex}`).value = task.title;
          worksheet.getCell(`C${rowIndex}`).value = assignedTo;
          worksheet.getCell(`D${rowIndex}`).value = task.priority;
          worksheet.getCell(`E${rowIndex}`).value = task.state === 1 ? 'In Progress' : 'Completed';

          // Apply borders to the cells
          for (let col = 1; col <= 5; col++) {
            const cell = worksheet.getCell(rowIndex, col);
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          }

          rowIndex++;
        }
      }
    }

    rowIndex += 2; // Add some space before the next section

    // Add Employees Information
    worksheet.mergeCells(`A${rowIndex}:E${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = 'Employees';
    worksheet.getCell(`A${rowIndex}`).font = { bold: true, size: 16 };
    rowIndex += 1;

    // Define employee table headers
    worksheet.getCell(`A${rowIndex}`).value = 'Employee ID';
    worksheet.getCell(`B${rowIndex}`).value = 'First Name';
    worksheet.getCell(`C${rowIndex}`).value = 'Last Name';
    worksheet.getCell(`D${rowIndex}`).value = 'Phone Number';
    worksheet.getCell(`E${rowIndex}`).value = 'Age';

    // Style header
    for (let col = 1; col <= 5; col++) {
      const cell = worksheet.getCell(rowIndex, col);
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFC425' }, // Light yellow background
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
    rowIndex++;

    for (const employeeId of employeeIds) {
      const employee = await getEmployeeById(employeeId);

      if (employee) {
        worksheet.getCell(`A${rowIndex}`).value = employee.employee_id;
        worksheet.getCell(`B${rowIndex}`).value = employee.firstName;
        worksheet.getCell(`C${rowIndex}`).value = employee.lastName;
        worksheet.getCell(`D${rowIndex}`).value = employee.phoneNumber;
        worksheet.getCell(`E${rowIndex}`).value = employee.age;

        // Apply borders to the cells
        for (let col = 1; col <= 5; col++) {
          const cell = worksheet.getCell(rowIndex, col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        }

        rowIndex++;
      }
    }

    // Adjust column widths
    worksheet.columns = [
      { key: 'A', width: 25 },
      { key: 'B', width: 25 },
      { key: 'C', width: 25 },
      { key: 'D', width: 20 },
      { key: 'E', width: 30 },
    ];

    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return the Excel file as a response
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Work_Order_Report_${orderId}.xlsx"`,
      },
    });
  } catch (error) {
    console.error(
      'Error generating work order Excel report:',
      error instanceof Error ? error.stack : error
    );
    return NextResponse.json({ error: 'Failed to generate Excel report' }, { status: 500 });
  }
}
