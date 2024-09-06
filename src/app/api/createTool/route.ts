/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createTool } from "~/server/queries/tool/queries";
import { type CreateTool } from "~/server/types/ITool";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const toolData: CreateTool = body;

    // name: string,
    // brand: string,
    // condition: string,
    // quantity: number,
    // location_id: number,
    // created_at: Date,
    // category: string,
    // tool_type: string,
    // acquisition_date: Date,
    // observations?: string,

    const result = await createTool(
      toolData.name,
      toolData.brand,
      toolData.condition,
      +toolData.quantity,
      toolData.location_id,
      toolData.category,
      toolData.tool_type,
      new Date(toolData.acquisition_date),
      toolData.observations,
    );
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create Tool" },
      { status: 500 },
    );
  }
}
