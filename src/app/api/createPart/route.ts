/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createPart } from "~/server/queries/part/queries";
import { type CreatePart } from "~/server/types/IPart";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const partData: CreatePart = body;

    // name: string,
    // created_at: Date,
    // part_number: string,
    // condition: string, // MAYBE MAKE AN ENUM
    // length: number,
    // quantity: number,
    // location_id: number,
    // length_unit: string, // MAYBE MAKE AN ENUM
    // width: number,
    // width_unit: string,
    // height: number,
    // height_unit: string,
    // compatible_machines?: string,

    const result = await createPart(
      partData.name,
      partData.part_number,
      partData.condition,
      +partData.length,
      +partData.quantity,
      partData.location_id,
      partData.length_unit,
      +partData.width,
      partData.width_unit,
      +partData.height,
      partData.height_unit,
      partData.compatible_machines,
    );
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create Part" },
      { status: 500 },
    );
  }
}
