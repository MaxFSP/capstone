/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateMachinery } from "~/server/queries/machinery/queries";
import { type Machinery } from "~/server/types/IMachinery";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Type assertion
    const machineryData: Machinery = body;
    const result = await updateMachinery(
      machineryData.machine_id,
      machineryData.brand,
      machineryData.model,
      machineryData.year,
      machineryData.serial_number,
      machineryData.location_id,
      machineryData.state,
      machineryData.observations,
    );
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update Machinery" },
      { status: 500 },
    );
  }
}
