import "server-only";

//DB stuff
import { db } from "../../db";
import { workOrders } from "../../db/schema";
import { eq } from "drizzle-orm";

// Employees Table --------------------------------------------------------------------------------------------

// Create Employee
export async function createWorkOrder(
  name: string,
  machine_id: number,
  observations: string,
  start_date: Date,
  assigned_user: number,
) {
  const newEmployee = await db
    .insert(workOrders)
    .values({
      name: name,
      machine_id: machine_id,
      observations: observations,
      start_date: start_date,
      assigned_user: assigned_user,
    })
    .returning();
  return newEmployee;
}

// Read Employees

export async function getWorkOrders() {
  const allWorkOrders = await db.query.workOrders.findMany({
    orderBy: (workOrders, { asc }) => asc(workOrders.order_id),
  });
  return allWorkOrders;
}

export async function getWorkOrderById(orderId: number) {
  const workOrder = await db.query.workOrders.findFirst({
    where: (workOrders, { eq }) => eq(workOrders.order_id, orderId),
  });
  return workOrder;
}

// Update Emmployee
export async function updateWorkOrder(
  order_id: number,
  name?: string,
  machine_id?: number,
  observations?: string,
  start_date?: Date,
  assigned_user?: number,
) {
  const updatedEmployee = await db
    .update(workOrders)
    .set({
      name: name,
      machine_id: machine_id,
      observations: observations,
      start_date: start_date,
      assigned_user: assigned_user,
    })
    .where(eq(workOrders.order_id, order_id))
    .returning();

  return updatedEmployee;
}

export async function addEndDateToWorkOrder(order_id: number, end_date: Date) {
  await db
    .update(workOrders)
    .set({
      end_date: end_date,
    })
    .where(eq(workOrders.order_id, order_id))
    .returning();
}

// Delete Fix
export async function deteWorkOrder(order_id: number) {
  const deletedWorkOrder = await db

    .delete(workOrders)
    .where(eq(workOrders.order_id, order_id))
    .returning();
  return deletedWorkOrder;
}