/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createMachinery } from '~/server/queries/machinery/queries';
import { type CreateMachinery } from '~/server/types/IMachinery';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const machineryData: CreateMachinery = body;

    const result = await createMachinery(
      machineryData.brand,
      machineryData.model,
      +machineryData.year,
      new Date(machineryData.acquisition_date),
      machineryData.serial_number,
      machineryData.location_id,
      machineryData.state,
      machineryData.observations ?? undefined
    );
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('Error creating machinery:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create Machinery' },
      { status: 500 }
    );
  }
}
