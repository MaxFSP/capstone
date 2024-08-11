/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createTask } from "~/server/queries/columnTasks/queries";
import { type CreateTask } from "~/server/types/ITasks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const taskData: CreateTask = body;

    const result = await createTask(
      taskData.title,
      taskData.description,
      taskData.position,
      new Date(taskData.start_date),
      new Date(taskData.end_date),
      taskData.column_id,
      taskData.assigned_to,
      taskData.priority,
    );
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
