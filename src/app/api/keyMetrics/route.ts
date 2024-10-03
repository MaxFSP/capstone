// /app/api/keyMetrics/route.ts

import { NextResponse } from 'next/server';
import { totalMachines } from '~/server/queries/machinery/queries';
import { totalParts } from '~/server/queries/part/queries';
import { totalTools } from '~/server/queries/tool/queries';

export async function GET() {
  try {
    const [machines, parts, tools] = await Promise.all([
      totalMachines(),
      totalParts(),
      totalTools(),
    ]);

    const keyMetrics = {
      totalMachines: machines,
      totalParts: parts,
      totalTools: tools,
    };

    return NextResponse.json(keyMetrics);
  } catch (error) {
    console.error('Error fetching key metrics:', error);
    return NextResponse.error();
  }
}
