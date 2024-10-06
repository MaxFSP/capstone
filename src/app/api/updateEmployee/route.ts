/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { updateEmployee } from '~/server/queries/employee/queries';
import { type Employee } from '~/server/types/IEmployee';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Type assertion
    const employeeData: Employee = body;

    const result = await updateEmployee(
      employeeData.employee_id,
      employeeData.firstName,
      employeeData.lastName,
      +employeeData.age,
      new Date(employeeData.hireDate),
      employeeData.phoneNumber,
      employeeData.job,
      employeeData.bloodType
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    if (error.detail.includes('already exists')) {
      return NextResponse.json({ error: 'Phone number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}
