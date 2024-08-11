import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { moveTask } from "~/server/queries/columnTasks/queries";
import { type MovingTask } from "~/server/types/ITasks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const taskData: MovingTask = body;
    const result = await moveTask(
      taskData.task_id,
      taskData.new_column_id,
      taskData.new_position,
    );
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to move task" }, { status: 500 });
  }
}
