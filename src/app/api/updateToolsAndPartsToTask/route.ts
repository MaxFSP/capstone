import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  addPartsToTask,
  addToolsToTask,
  deleteAllToolsInTask,
  deleteAllPartsInTask,
} from "~/server/queries/columnTasks/queries";
import { type ToolsAndParts } from "~/server/types/ITasks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const taskData: ToolsAndParts = body;
    await deleteAllToolsInTask(taskData.task_id);
    await deleteAllPartsInTask(taskData.task_id);

    if (taskData.tools.length > 0) {
      // add tools to task one by one
      for (const toolId of taskData.tools) {
        await addToolsToTask(taskData.task_id, toolId);
      }
    }
    if (taskData.parts.length > 0) {
      // add parts to task one by one
      for (const partId of taskData.parts) {
        await addPartsToTask(taskData.task_id, partId);
      }
    }

    const result = "Success";
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add tools and parts to task" },
      { status: 500 },
    );
  }
}
