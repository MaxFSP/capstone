/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getPartsInTask, getToolsInTask } from '~/server/queries/columnTasks/queries';
import { type Tool } from '~/server/types/ITool';
import { type Part } from '~/server/types/IPart';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const task_id: { task_id: number } = body;

    const result = await getToolsInTask(task_id.task_id);
    const tools = result;
    const parts = await getPartsInTask(task_id.task_id);
    const partList = parts;

    const toolsAndParts = {
      tools: tools,
      parts: partList,
    };

    if (tools.length < 0) toolsAndParts.tools = [];

    if (partList.length < 0) toolsAndParts.parts = [];

    return NextResponse.json({ data: toolsAndParts }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create Task' }, { status: 500 });
  }
}
