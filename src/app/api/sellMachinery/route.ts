/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sellMachinery } from "~/server/queries/machinery/queries";
import { type SellMachinery } from "~/server/types/IMachinery";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Type assertion
    const machineryData: SellMachinery = body;

    const result = await sellMachinery(
      machineryData.machine_id,
      new Date(machineryData.sold_date),
      machineryData.sold_price,
      machineryData.sold_to,
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
