/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createWorkOrder, getWorkOrdersByUserId } from '~/server/queries/workOrder/queries';
import { type CreateWorkOrder } from '~/server/types/IOrders';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const WorkOrderData: CreateWorkOrder = body;

    const workOrderByUserId = await getWorkOrdersByUserId(+WorkOrderData.assigned_user);

    const isAnyWorkOrderEnabled = workOrderByUserId.some(
      (workOrder: { state: number }) => workOrder.state === 1
    );

    if (isAnyWorkOrderEnabled) {
      const result = await createWorkOrder(
        WorkOrderData.name,
        +WorkOrderData.machine_id,
        WorkOrderData.observations,
        new Date(WorkOrderData.start_date),
        +WorkOrderData.assigned_user,
        0
      );
      return NextResponse.json({ data: result }, { status: 200 });
    } else {
      const result = await createWorkOrder(
        WorkOrderData.name,
        +WorkOrderData.machine_id,
        WorkOrderData.observations,
        new Date(WorkOrderData.start_date),
        +WorkOrderData.assigned_user,
        1
      );
      return NextResponse.json({ data: result }, { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create Machinery' }, { status: 500 });
  }
}
