import { NextResponse } from 'next/server';
import { getColumnTasksByWorkOrderId } from '~/server/queries/columnsWorkOrder/queries';
import { getWorkOrderBySessionId } from '~/server/queries/workOrder/queries';
import { getTasksByColumnId } from '~/server/queries/columnTasks/queries';
import { getEmployees } from '~/server/queries/employee/queries';
import { getTools } from '~/server/queries/tool/queries';
import { getParts } from '~/server/queries/part/queries';
import { type Employee } from '~/server/types/IEmployee';
import { type RegularWorkOrder } from '~/server/types/IOrders';
import { type Part } from '~/server/types/IPart';
import { type TasksOnColumns } from '~/server/types/ITasks';
import { type Tool } from '~/server/types/ITool';
import { type Column } from '~/server/types/IColumns';

interface DashboardData {
  workOrder: RegularWorkOrder | undefined;
  tasksOnColumns: TasksOnColumns;
  columnsWorkOrder: Column[];
  employees: Employee[];
  tools: Tool[];
  parts: Part[];
}

export async function GET(request: Request) {
  const workOrders = await getWorkOrderBySessionId();
  const tasksOnColumns: TasksOnColumns = {};
  let columnsWorkOrder: Column[] = [];
  const employees = await getEmployees();
  const tools = await getTools();
  const parts = await getParts();

  // Filter active work orders
  const enabledWorkOrders = workOrders.filter((order) => order.state === 1);
  let currentWorkOrder = enabledWorkOrders[0];

  if (currentWorkOrder) {
    if (currentWorkOrder.state === 1) {
      columnsWorkOrder = await getColumnTasksByWorkOrderId(currentWorkOrder.order_id);
      columnsWorkOrder = columnsWorkOrder.filter((column) => column.state !== 0);
      columnsWorkOrder.sort((a, b) => a.position - b.position);

      if (columnsWorkOrder.length > 0) {
        columnsWorkOrder.forEach((column) => {
          tasksOnColumns[column.title] = [];
        });

        const columnIds = columnsWorkOrder.map((column) => column.column_id);
        const columnTasks = await getTasksByColumnId(columnIds);

        columnTasks.forEach((task) => {
          const column = columnsWorkOrder.find((col) => col.column_id === task.column_id);
          if (column && task.state === 1) {
            const columnTitle = column.title;
            tasksOnColumns[columnTitle].push(task);
          }
        });

        // Sort the tasks by position in the column
        Object.keys(tasksOnColumns).forEach((key) => {
          tasksOnColumns[key] = tasksOnColumns[key].sort((a, b) => a.position - b.position);
        });
      }
    } else {
      currentWorkOrder = undefined;
    }
  }

  return NextResponse.json({
    workOrder: currentWorkOrder,
    tasksOnColumns,
    columnsWorkOrder,
    employees,
    tools,
    parts,
  });
}
