import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { deleteTask } from "~/server/queries/columnTasks/queries";
import { type Task } from "~/server/types/ITasks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const taskData: Task = body;
    const result = await deleteTask(taskData.task_id);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
