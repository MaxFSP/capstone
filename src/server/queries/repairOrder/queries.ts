//DB stuff
import { db } from "../../db";
import { repairOrders } from "../../db/schema";
import { eq } from "drizzle-orm";

// Repair Orders Table --------------------------------------------------------------------------------------------

// Create Repair Order
export async function createRepairOrder(
  name: string,
  userId: number,
  fixId: number,
) {
  const newRepairOrder = await db
    .insert(repairOrders)
    .values({
      name,
      user_id: userId,
      fix_id: fixId,
    })
    .returning();
  return newRepairOrder;
}

// Read Repair Orders
export async function getRepairOrders() {
  const allRepairOrders = await db.query.repairOrders.findMany({
    orderBy: (repairOrders, { asc }) => asc(repairOrders.order_id),
  });
  return allRepairOrders;
}

export async function getRepairOrderById(orderId: number) {
  const repairOrder = await db.query.repairOrders.findFirst({
    where: (repairOrders, { eq }) => eq(repairOrders.order_id, orderId),
  });
  return repairOrder;
}

// Update Repair Order
export async function updateRepairOrder(
  orderId: number,
  name?: string,
  userId?: number,
  fixId?: number,
) {
  const updatedRepairOrder = await db
    .update(repairOrders)
    .set({ name, user_id: userId, fix_id: fixId })
    .where(eq(repairOrders.order_id, orderId))
    .returning();
  return updatedRepairOrder;
}

// Delete Repair Order
export async function deleteRepairOrder(orderId: number) {
  const deletedRepairOrder = await db
    .delete(repairOrders)
    .where(eq(repairOrders.order_id, orderId))
    .returning();
  return deletedRepairOrder;
}
