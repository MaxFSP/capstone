/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  UpdateWorkOrderState,
  getWorkOrderById,
  getWorkOrdersByUserId,
} from '~/server/queries/workOrder/queries';

interface UpdateWorkOrderStateData {
  order_id: number;
  state: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Type assertion
    const workOrderData: UpdateWorkOrderStateData = body;

    // Retrieve the original work order
    const originalWorkOrder = await getWorkOrderById(workOrderData.order_id);
    if (!originalWorkOrder) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    const assignedUserId = +originalWorkOrder.assigned_user;

    // Get all work orders assigned to this user, excluding the current one
    const workOrdersByUser = await getWorkOrdersByUserId(assignedUserId);
    const otherWorkOrders = workOrdersByUser.filter(
      (workOrder) => workOrder.order_id !== workOrderData.order_id
    );

    // Check if any other work order is enabled
    const hasOtherEnabledWorkOrder = otherWorkOrders.some((workOrder) => workOrder.state === 1);

    if (workOrderData.state === 1 && hasOtherEnabledWorkOrder) {
      // User already has an enabled work order; cannot enable another
      return NextResponse.json(
        {
          error: 'There is already an enabled work order for this user. Cannot enable another.',
        },
        { status: 400 }
      );
    } else {
      // Proceed to update the work order state
      const result = await UpdateWorkOrderState(workOrderData.order_id, workOrderData.state);

      return NextResponse.json({ data: result }, { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update Work Order' }, { status: 500 });
  }
}
