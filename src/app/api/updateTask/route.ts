import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateTask } from "~/server/queries/columnTasks/queries";
import { type Task } from "~/server/types/ITasks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const taskData: Task = body;
    const result = await updateTask(
      taskData.task_id,
      taskData.title,
      taskData.description,
      taskData.position,
      new Date(taskData.start_date),
      new Date(taskData.end_date),
      taskData.column_id,
      taskData.assigned_to,
      taskData.priority,
      taskData.state,
    );
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}
