/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// File: ~/app/api/createPart/route.ts

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createPart } from '~/server/queries/part/queries';
import type { CreatePart } from '~/server/types/IPart';
import { z } from 'zod';

// Define the Zod schema for CreatePart with corrected preprocessing
const CreatePartSchema = z.object({
  part_id: z.number().int().nonnegative(),
  name: z.string().min(1, 'Name cannot be empty.'),
  part_number: z
    .string()
    .regex(/^[A-Za-z0-9-]+$/, 'Part number can only contain letters, numbers, and hyphens.'),
  condition: z.enum(['Good', 'Bad', 'Excellent', 'Poor']),
  quantity: z.number().int().positive('Quantity must be greater than 0.'),
  location_id: z.number().int().positive('Location ID must be a positive integer.'),
  location_name: z.string().min(1, 'Location name cannot be empty.'),
  length: z.number().positive('Length must be greater than 0.'),
  length_unit: z.enum(['cm', 'mm']),
  width: z.number().positive('Width must be greater than 0.'),
  width_unit: z.enum(['cm', 'mm']),
  height: z.number().positive('Height must be greater than 0.'),
  height_unit: z.enum(['cm', 'mm']),
  compatible_machines: z.string().min(1, 'Compatible machines cannot be empty.'),
  acquisition_date: z.preprocess((arg) => {
    if (typeof arg === 'string') {
      return new Date(arg);
    }
    return arg;
  }, z.date()),
  images: z.array(
    z.object({
      url: z.string().url(),
      altText: z.string().optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the incoming data against the schema
    const parseResult = CreatePartSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0];
      const errorMessage = firstError?.message ?? 'Invalid data provided.';

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const partData: CreatePart = parseResult.data;

    // Proceed to create the part
    const result = await createPart(
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
      partData.compatible_machines
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/createPart:', error);
    return NextResponse.json({ error: 'Failed to create Part.' }, { status: 500 });
  }
}
