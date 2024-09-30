/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { updateTool } from '~/server/queries/tool/queries';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { type Tool } from '~/server/types/ITool';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Type assertion
    const toolData: Tool = body;
    const result = await updateTool(
      toolData.tool_id,
      toolData.name,
      toolData.brand,
      toolData.category,
      toolData.tool_type,
      toolData.condition,
      toolData.quantity,
      toolData.location_id,
      toolData.observations ?? undefined
    );
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update Tool' }, { status: 500 });
  }
}
