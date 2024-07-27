/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updatePart } from "~/server/queries/part/queries";
import { type Part } from "~/server/types/IPart";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Type assertion
    const partData: Part = body;

    const result = await updatePart(
      partData.part_id,
      partData.name,
      partData.part_number,
      partData.condition,
      partData.length,
      partData.quantity,
      partData.location_id,
      partData.length_unit,
      partData.width,
      partData.width_unit,
      partData.height,
      partData.height_unit,
      partData.compatible_machines,
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update Part" },
      { status: 500 },
    );
  }
}
