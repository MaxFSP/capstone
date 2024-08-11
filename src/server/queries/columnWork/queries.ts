import "server-only";

//DB stuff
import { db } from "../../db";
import { workColumns } from "../../db/schema";
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
    })
    .returning();
  return newColumn;
}

export async function deleteColumn(columnId: number) {
  const deletedColumn = await db
    .delete(workColumns)
    .where(eq(workColumns.column_id, columnId))
    .returning();
  return deletedColumn;
}
