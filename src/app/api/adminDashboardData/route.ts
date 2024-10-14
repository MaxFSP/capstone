import { NextResponse } from 'next/server';
import { getWorkOrders } from '~/server/queries/workOrder/queries';
import { type Employee } from '~/server/types/IEmployee';
import { type RegularWorkOrder } from '~/server/types/IOrders';
import { type TasksOnColumns } from '~/server/types/ITasks';
import { type Column } from '~/server/types/IColumns';

interface DashboardData {
  workOrder: RegularWorkOrder | undefined;
  tasksOnColumns: TasksOnColumns;
  columnsWorkOrder: Column[];
  employees: Employee[];
}

export async function GET(request: Request) {
  const workOrders = await getWorkOrders();

  return NextResponse.json({
    workOrder: workOrders,
  });
}
