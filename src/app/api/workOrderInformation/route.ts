/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// app/api/workOrderData/route.ts

import { NextResponse } from 'next/server';
import { getWorkOrderById } from '~/server/queries/workOrder/queries';
import { getColumnTasksByWorkOrderId } from '~/server/queries/columnsWorkOrder/queries';
import { getTasksByColumnId } from '~/server/queries/columnTasks/queries';
import { getMachineryById } from '~/server/queries/machinery/queries';
import { getUserById } from '~/server/queries/user/queries';
import { getEmployeeById } from '~/server/queries/employee/queries';
import { type Column } from '~/server/types/IColumns';
import { type Task, type TasksOnColumns } from '~/server/types/ITasks';
import { type Employee } from '~/server/types/IEmployee';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId in request body' }, { status: 400 });
    }

    // Fetch work order data
    const workOrder = await getWorkOrderById(orderId);
    if (!workOrder) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    // Fetch columns associated with the work order
    let columnsWorkOrder: Column[] = await getColumnTasksByWorkOrderId(orderId);
    columnsWorkOrder = columnsWorkOrder.filter((column) => column.state !== 0);
    columnsWorkOrder.sort((a, b) => a.position - b.position);

    // Initialize tasksOnColumns object
    const tasksOnColumns: TasksOnColumns = {};
    columnsWorkOrder.forEach((column) => {
      tasksOnColumns[column.title] = [];
    });

    // Fetch tasks associated with the columns
    const columnIds = columnsWorkOrder.map((column) => column.column_id);
    const columnTasks = await getTasksByColumnId(columnIds);

    // Filter and sort tasks, and assign them to their respective columns
    columnTasks.forEach((task) => {
      if (task.state === 1) {
        const column = columnsWorkOrder.find((col) => col.column_id === task.column_id);
        if (column) {
          tasksOnColumns[column.title]!.push(task as Task);
        }
      }
    });

    // Sort tasks within each column by their position
    Object.keys(tasksOnColumns).forEach((key) => {
      if (tasksOnColumns[key]) {
        tasksOnColumns[key] = tasksOnColumns[key]!.sort((a, b) => a.position - b.position);
      }
    });

    // Fetch machinery details
    const machinery = await getMachineryById(workOrder.machine_id);
    if (!machinery) {
      return NextResponse.json({ error: 'Machinery not found' }, { status: 404 });
    }

    // Fetch user details
    const user = await getUserById(workOrder.assigned_user);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Collect unique employee IDs from tasks
    const employeeIds = new Set<number>();
    columnTasks.forEach((task) => {
      if (task.assigned_to) {
        employeeIds.add(task.assigned_to);
      }
    });

    // Fetch employee details
    const employees: Employee[] = [];
    for (const employeeId of employeeIds) {
      const employee = await getEmployeeById(employeeId);
      if (employee) {
        employees.push(employee);
      }
    }

    // Prepare the response data
    const responseData = {
      workOrder,
      tasksOnColumns,
      columnsWorkOrder,
      machinery,
      user,
      employees,
    };

    // Return the data as JSON
    return NextResponse.json({ data: responseData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching work order data:', error);
    return NextResponse.json({ error: 'Failed to fetch work order data' }, { status: 500 });
  }
}
