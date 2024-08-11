/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateWorkOrder } from "~/server/queries/workOrder/queries";
import { type WorkOrders } from "~/server/types/IOrders";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Type assertion
    const workOrderData: WorkOrders = body;

    const result = await updateWorkOrder(
      workOrderData.order_id,
      workOrderData.name,
      +workOrderData.machine_id,
      workOrderData.observations ?? "",
      new Date(workOrderData.start_date),
      +workOrderData.assigned_user,
      workOrderData.state,
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update Work Order" },
      { status: 500 },
    );
  }
}
