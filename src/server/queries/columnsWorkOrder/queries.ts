import "server-only";

//DB stuff
import { db } from "../../db";
import { workColumns } from "../../db/schema";
import { type Column } from "~/server/types/IColumns";
import { eq } from "drizzle-orm";

// Employees Table --------------------------------------------------------------------------------------------

// Create Employee

export async function getColumnTasksByWorkOrderId(order_id: number) {
  const allColumnTasks = await db.query.workColumns.findMany({
    where: (columnTasks, { eq }) => eq(columnTasks.order_id, order_id),
  });
  return allColumnTasks;
}

export async function createColumnTask(
  order_id: number,
  title: string,
  position: number,
) {
  const newColumnTask = await db
    .insert(workColumns)
    .values({
      order_id: order_id,
      title: title,
      position: position,
    })
    .returning();
  return newColumnTask;
}

export async function updateColumns(columns: Column[]) {
  for (const column of columns) {
    await db
      .update(workColumns)
      .set({
        position: column.position,
      })
      .where(eq(workColumns.column_id, column.column_id))
      .returning();
  }
}
