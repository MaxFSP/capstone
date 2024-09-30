/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { partStock, toolStock, workOrders, machineryStock, employees } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

interface DeleteEntityRequest {
  entityType: 'part' | 'tool' | 'machinery' | 'workOrder' | 'employee';
  entityId: number;
}

export async function POST(req: Request) {
  let body: DeleteEntityRequest;

  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid JSON' });
  }

  const { entityType, entityId } = body;

  if (typeof entityId !== 'number') {
    return NextResponse.json({ success: false, error: 'Invalid entity ID' });
  }

  try {
    switch (entityType) {
      case 'part':
        await db.update(partStock).set({ state: 0 }).where(eq(partStock.part_id, entityId));
        break;
      case 'tool':
        await db.update(toolStock).set({ state: 0 }).where(eq(toolStock.tool_id, entityId));
        break;
      case 'machinery':
        await db
          .update(machineryStock)
          .set({ availability: 0 })
          .where(eq(machineryStock.machine_id, entityId));
        break;
      case 'workOrder':
        await db.update(workOrders).set({ state: 0 }).where(eq(workOrders.order_id, entityId));
        break;

      case 'employee':
        await db.update(employees).set({ state: 0 }).where(eq(employees.employee_id, entityId));
      default:
        return NextResponse.json({ success: false, error: 'Invalid entity type' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting ${entityType}:`, error);
    return NextResponse.json({ success: false, error: `Failed to delete ${entityType}` });
  }
}
