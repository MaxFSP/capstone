import 'server-only';

//DB stuff
import { db } from '../../db';
import { employees } from '../../db/schema';
import { eq } from 'drizzle-orm';

// Employees Table --------------------------------------------------------------------------------------------

// Create Employee
export async function createEmployee(
  firstName: string,
  lastName: string,
  age: number,
  hireDate: Date,
  phoneNumber: string,
  job: string,
  bloodType: string
) {
  const newEmployee = await db
    .insert(employees)
    .values({
      firstName: firstName,
      lastName: lastName,
      age: age,
      hireDate: hireDate,
      phoneNumber: phoneNumber,
      job: job,
      bloodType: bloodType,
      state: 1,
    })
    .returning();
  return newEmployee;
}

// Read Employees

export async function getEmployees() {
  const allEmployees = await db.query.employees.findMany({
    orderBy: (employees, { asc }) => asc(employees.employee_id),
  });
  return allEmployees;
}

export async function getEmployeeById(employeeId: number) {
  const employee = await db.query.employees.findFirst({
    where: (employees, { eq }) => eq(employees.employee_id, employeeId),
  });
  return employee;
}

// Update Emmployee
export async function updateEmployee(
  employee_id: number,
  firstName?: string,
  lastName?: string,
  age?: number,
  hireDate?: Date,
  phoneNumber?: string,
  job?: string,
  bloodType?: string
) {
  const updatedEmployee = await db
    .update(employees)
    .set({
      firstName: firstName,
      lastName: lastName,
      age: age,
      hireDate: hireDate,
      phoneNumber: phoneNumber,
      job: job,
      bloodType: bloodType,
    })
    .where(eq(employees.employee_id, employee_id))
    .returning();

  return updatedEmployee;
}

export async function addImageToEmployee(employee_id: number, imageUrl: string, imageKey: string) {
  await db
    .update(employees)
    .set({
      imageUrl: imageUrl,
      imageKey: imageKey,
    })
    .where(eq(employees.employee_id, employee_id))
    .returning();
}
// Delete Fix
export async function deleteEmployee(employeeId: number) {
  const deletedEmployee = await db
    .delete(employees)
    .where(eq(employees.employee_id, employeeId))
    .returning();
  return deletedEmployee;
}

export async function deleteImageEmployee(employee_id: number) {
  await db
    .update(employees)
    .set({
      imageUrl: null,
      imageKey: null,
    })
    .where(eq(employees.employee_id, employee_id))
    .returning();
}
