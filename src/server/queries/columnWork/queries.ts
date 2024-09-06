import "server-only";

//DB stuff
import { db } from "../../db";
import { workColumns, workTasks } from "../../db/schema";
import { eq } from "drizzle-orm";

export async function createColumn(
  title: string,
  position: number,
  order_id: number,
) {
  const newColumn = await db
    .insert(workColumns)
    .values({
      title,
      position,
      order_id,
      state: 1,
    })
    .returning();
  return newColumn;
}

export async function deleteColumn(columnId: number) {
  const deleteAllTasks = await db
    .update(workTasks)
    .set({
      state: 0,
    })
    .where(eq(workTasks.column_id, columnId));

  const deletedColumn = await db
    .update(workColumns)
    .set({
      state: 0,
    })
    .where(eq(workColumns.column_id, columnId))
    .returning();

  return deletedColumn;
}

export async function updateColumn(columnId: number, title: string) {
  const updatedColumn = await db
    .update(workColumns)
    .set({
      title: title,
    })
    .where(eq(workColumns.column_id, columnId))
    .returning();
  return updatedColumn;
}
