/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createColumn } from "~/server/queries/columnWork/queries";
import { type CreateColumn } from "~/server/types/IColumns";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const columnData: CreateColumn = body;

    const result = await createColumn(
      columnData.title,
      +columnData.position,
      +columnData.order_id,
    );
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create Column" },
      { status: 500 },
    );
  }
}
