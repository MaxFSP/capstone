import "server-only";

//DB stuff
import { db } from "../../db";
import { fixes } from "../../db/schema";
import { eq } from "drizzle-orm";

// Fixes Table --------------------------------------------------------------------------------------------

// Create Fix
export async function createFix(
  name: string,
  partId: number,
  toolId: number,
  machineId: number,
) {
  const newFix = await db
    .insert(fixes)
    .values({
      name,
      part_id: partId,
      tool_id: toolId,
      machine_id: machineId,
    })
    .returning();
  return newFix;
}

// Read Fixes
export async function getFixes() {
  const allFixes = await db.query.fixes.findMany({
    orderBy: (fixes, { asc }) => asc(fixes.fix_id),
  });
  return allFixes;
}

export async function getFixById(fixId: number) {
  const fix = await db.query.fixes.findFirst({
    where: (fixes, { eq }) => eq(fixes.fix_id, fixId),
  });
  return fix;
}

// Update Fix
export async function updateFix(
  fixId: number,
  name?: string,
  partId?: number,
  toolId?: number,
  machineId?: number,
) {
  const updatedFix = await db
    .update(fixes)
    .set({ name, part_id: partId, tool_id: toolId, machine_id: machineId })
    .where(eq(fixes.fix_id, fixId))
    .returning();
  return updatedFix;
}

// Delete Fix
export async function deleteFix(fixId: number) {
  const deletedFix = await db
    .delete(fixes)
    .where(eq(fixes.fix_id, fixId))
    .returning();
  return deletedFix;
}
