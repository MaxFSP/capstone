import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createTool } from '~/server/queries/tool/queries';
import type { CreateTool } from '~/server/types/ITool';

import { z } from 'zod';

const CreateToolSchema = z.object({
  name: z.string().regex(/^[A-Za-z\s]+$/, 'Name must contain only letters and spaces.'),
  brand: z.string().regex(/^[A-Za-z\s]+$/, 'Brand must contain only letters and spaces.'),
  category: z.string().regex(/^[A-Za-z\s]+$/, 'Category must contain only letters and spaces.'),
  tool_type: z.string().regex(/^[A-Za-z\s]+$/, 'Tool Type must contain only letters and spaces.'),
  condition: z.enum(['Good', 'Bad', 'Excellent', 'Poor']),
  quantity: z
    .string()
    .regex(/^[0-9]+$/, 'Quantity must be a positive integer.')
    .transform(Number)
    .refine((val) => val > 0, {
      message: 'Quantity must be greater than zero.',
    }),
  location_id: z.number().int().positive('Location ID must be a positive integer.'),
  acquisition_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Acquisition date is invalid.',
    })
    .transform((date) => new Date(date)),
  observations: z
    .string()
    .regex(/^[A-Za-z0-9\s]+$/, 'Observations can only contain letters, numbers, and spaces.')
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();

    const parsed = CreateToolSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]!.message }, { status: 400 });
    }

    const toolData: CreateTool = {
      name: parsed.data.name,
      brand: parsed.data.brand,
      category: parsed.data.category,
      tool_type: parsed.data.tool_type,
      condition: parsed.data.condition,
      quantity: parsed.data.quantity,
      location_id: parsed.data.location_id,
      acquisition_date: parsed.data.acquisition_date,
      observations: parsed.data.observations ?? null,
    };

    const result = await createTool(
      toolData.name,
      toolData.brand,
      toolData.condition,
      toolData.quantity,
      toolData.location_id,
      toolData.category,
      toolData.tool_type,
      toolData.acquisition_date,
      toolData.observations ?? undefined
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/createTool:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating the tool.' },
      { status: 500 }
    );
  }
}
