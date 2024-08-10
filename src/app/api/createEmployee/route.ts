/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createEmployee } from "~/server/queries/employee/queries";
import { type CreateEmployee } from "~/server/types/IEmployee";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const EmployeeData: CreateEmployee = body;
    EmployeeData;
    const result = await createEmployee(
      EmployeeData.firstName,
      EmployeeData.lastName,
      +EmployeeData.age,
      new Date(EmployeeData.hireDate),
      EmployeeData.phoneNumber,
      EmployeeData.job,
      EmployeeData.bloodType,
    );
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create Employee" },
      { status: 500 },
    );
  }
}
