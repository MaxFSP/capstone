import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { deleteColumn } from "~/server/queries/columnWork/queries";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const columnData: number = body;

    const result = await deleteColumn(columnData);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: "Failed to delete column",
    });
  }
}
