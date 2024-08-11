import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { type WorkOrders } from "~/server/types/IOrders";
import { type TasksOnColumns } from "~/server/types/ITasks";
import { type Column } from "~/server/types/IColumns";
import { workOrderDone } from "~/server/queries/workOrder/queries";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const workOrderData: WorkOrders = body.workOrder;
    const tasksData: TasksOnColumns = body.tasks;
    const columnsData: Column[] = body.columns;

    // Get the id of all the columns and put them in an array number[]
    const tasksIds = Object.keys(tasksData)
      .flatMap((key) => tasksData[key]?.map((task) => task?.task_id) || [])
      .filter((id): id is number => id !== null && id !== undefined);

    const columnsIds = columnsData.map((column) => column.column_id);

    await workOrderDone(
      workOrderData.order_id,
      tasksIds as number[],
      columnsIds as number[],
    );
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update task positions" },
      { status: 500 },
    );
  }
}
