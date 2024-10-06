/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  getWorkOrderById,
  getWorkOrdersByUserId,
  updateWorkOrder,
} from '~/server/queries/workOrder/queries';
import { type WorkOrders } from '~/server/types/IOrders';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Type assertion
    const workOrderData: WorkOrders = body;

    const workOrderByUserId = await getWorkOrdersByUserId(+workOrderData.assigned_user);

    const originalWorkOrder = await getWorkOrderById(workOrderData.order_id);

    const isAnyWorkOrderEnabled = workOrderByUserId.some(
      (workOrder: { state: number }) => workOrder.state === 1
    );

    if (isAnyWorkOrderEnabled && originalWorkOrder?.order_id !== 1) {
      await updateWorkOrder(
        workOrderData.order_id,
        workOrderData.name,
        +workOrderData.machine_id,
        workOrderData.observations ?? '',
        new Date(workOrderData.start_date),
        +workOrderData.assigned_user,
        0
      );

      return NextResponse.json(
        { data: 'There is already a work order enabled for this user we set it to on hold ' },
        { status: 200 }
      );
    }
    const result = await updateWorkOrder(
      workOrderData.order_id,
      workOrderData.name,
      +workOrderData.machine_id,
      workOrderData.observations ?? '',
      new Date(workOrderData.start_date),
      +workOrderData.assigned_user,
      workOrderData.state
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update Work Order' }, { status: 500 });
  }
}
