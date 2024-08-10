/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateEmployee } from "~/server/queries/employee/queries";
import { type Employee } from "~/server/types/IEmployee";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Type assertion
    const employeeData: Employee = body;

    const result = await updateEmployee(
      employeeData.employee_id,
      employeeData.firstName,
      employeeData.lastName,
      employeeData.imageUrl,
      +employeeData.age,
      new Date(employeeData.hireDate),
      employeeData.job,
      employeeData.phoneNumber,
      employeeData.bloodType,
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update Part" },
      { status: 500 },
    );
  }
}
