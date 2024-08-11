import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateColumn } from "~/server/queries/columnWork/queries";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const columnData = body;

    const result = await updateColumn(columnData.column_id, columnData.title);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: "Failed to update column",
    });
  }
}
