import 'server-only';

//DB stuff
import { db } from '../../db';
import { workColumns, workOrders, workTasks } from '../../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { type RegularWorkOrder } from '~/server/types/IOrders';

// Employees Table --------------------------------------------------------------------------------------------

// Create Employee
export async function createWorkOrder(
  name: string,
  machine_id: number,
  observations: string,
  start_date: Date,
  assigned_user: number,
  state: number
) {
  const newEmployee = await db
    .insert(workOrders)
    .values({
      name: name,
      machine_id: machine_id,
      observations: observations,
      start_date: start_date,
      assigned_user: assigned_user,
      state: state,
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

export async function getWorkOrderBySessionId() {
  const user = auth();
  if (!user.userId) throw new Error('Unauthorized');
  const userId = user.userId;

  const getClerkUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerk_id, userId),
  });

  if (!getClerkUser) throw new Error('The user does not exist');

  const workOrder = await db.query.workOrders.findMany({
    where: (workOrders, { eq }) => eq(workOrders.assigned_user, getClerkUser.user_id),
  });

  return workOrder as RegularWorkOrder[];
}

// Update Emmployee
export async function updateWorkOrder(
  order_id: number,
  name?: string,
  machine_id?: number,
  observations?: string,
  start_date?: Date,
  assigned_user?: number,
  state?: number
) {
  const updatedEmployee = await db
    .update(workOrders)
    .set({
      name: name,
      machine_id: machine_id,
      observations: observations,
      start_date: start_date,
      assigned_user: assigned_user,
      state: state,
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

export async function workOrderDone(order_id: number, taskIds: number[], columnIds: number[]) {
  try {
    await db
      .update(workOrders)
      .set({
        state: 2,
      })
      .where(eq(workOrders.order_id, order_id))
      .returning();

    await db
      .update(workTasks)
      .set({
        state: 2,
      })
      .where(inArray(workTasks.task_id, taskIds))
      .returning();

    await db
      .update(workColumns)
      .set({
        state: 2,
      })
      .where(inArray(workColumns.column_id, columnIds))
      .returning();
  } catch (error) {
    console.error('Error updating work order:', error);
  }
}
