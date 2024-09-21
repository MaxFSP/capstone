/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { sellMachinery } from '~/server/queries/machinery/queries';
import type { SellMachinery } from '~/server/types/IMachinery';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Define the Zod schema for request validation
const sellMachinerySchema = z.object({
  machine_id: z.number().int().nonnegative(),
  sold_price: z.number().positive(),
  sold_date: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        const date = new Date(arg);
        return isNaN(date.getTime()) ? undefined : date;
      }
    },
    z.date({ required_error: 'Sold date is required', invalid_type_error: 'Invalid date format' })
  ),
  sold_to: z
    .string()
    .min(1, 'Sold To is required')
    .regex(/^[A-Za-z\s]+$/, 'Sold To must contain only letters and spaces'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate the incoming data using the Zod schema
    const machineryData: SellMachinery = sellMachinerySchema.parse(body);

    // Proceed with selling machinery
    const result = await sellMachinery(
      machineryData.machine_id,
      machineryData.sold_date,
      machineryData.sold_price,
      machineryData.sold_to
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      // Return validation errors with detailed messages
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Handle other types of errors
    return NextResponse.json({ error: 'Failed to sell machinery' }, { status: 500 });
  }
}
