import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateColumns } from "~/server/queries/columnsWorkOrder/queries";
import { type Column } from "~/server/types/IColumns";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const columnsData: Column[] = body;
    const result = await updateColumns(columnsData);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update columns" },
      { status: 500 },
    );
  }
}
