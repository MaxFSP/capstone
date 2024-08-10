/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createWorkOrder } from "~/server/queries/workOrder/queries";
import { type CreateWorkOrder } from "~/server/types/IOrders";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const WorkOrderData: CreateWorkOrder = body;
    WorkOrderData;
    const result = await createWorkOrder(
      WorkOrderData.name,
      +WorkOrderData.machine_id,
      WorkOrderData.observations,
      new Date(WorkOrderData.start_date),
      +WorkOrderData.assigned_user,
    );
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create Machinery" },
      { status: 500 },
    );
  }
}
