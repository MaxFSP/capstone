/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createEmployee } from '~/server/queries/employee/queries';
import { type CreateEmployee } from '~/server/types/IEmployee';
import { z } from 'zod';
import { createEmployeeSchema } from '~/server/types/IEmployee';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const preprocessedBody = {
      ...body,
      age: body.age !== undefined ? Number(body.age) : undefined,
      hireDate: body.hireDate !== undefined ? new Date(body.hireDate) : undefined,
    };

    // Validate the incoming data using the Zod schema
    const employeeData: CreateEmployee = createEmployeeSchema.parse(preprocessedBody);

    // Proceed with creating the employee
    const result = await createEmployee(
      employeeData.firstName,
      employeeData.lastName,
      employeeData.age,
      employeeData.hireDate,
      employeeData.phoneNumber,
      employeeData.job,
      employeeData.bloodType
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
    return NextResponse.json({ error: 'Failed to create Employee' }, { status: 500 });
  }
}
