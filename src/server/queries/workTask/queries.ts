// In src/server/queries/workTask/queries.ts
import 'server-only';

//DB stuff
import { db } from '../../db';
import { workColumns } from '../../db/schema';

export async function getTasksByWorkOrderId(orderId: number) {
  const tasks = await db.query.workTasks.findMany({
    where: (workTasks, { eq, inArray }) =>
      inArray(
        workTasks.column_id,
        db
          .select({ column_id: workColumns.column_id })
          .from(workColumns)
          .where(eq(workColumns.order_id, orderId))
      ),
    orderBy: (workTasks, { asc }) => [asc(workTasks.position)],
  });
  return tasks;
}
