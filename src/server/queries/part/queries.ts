import "server-only";

//DB stuff
import { db } from "../../db";
import { partStock } from "../../db/schema";
import { eq } from "drizzle-orm";

// Part Stock Table --------------------------------------------------------------------------------------------

// Create Part
export async function createPart(
  name: string,
  created_at: Date,
  part_number: string,
  condition: string, // MAYBE MAKE AN ENUM
  length: number,
  quantity: number,
  location_id: number,
  length_unit: string, // MAYBE MAKE AN ENUM
  width: number,
  width_unit: string,
  height: number,
  height_unit: string,
  compatible_machines?: string,
) {
  const newPart = await db
    .insert(partStock)
    .values({
      name,
      created_at,
      part_number,
      condition,
      length,
      quantity,
      location_id,
      length_unit,
      width,
      width_unit,
      height,
      height_unit,
      compatible_machines,
    })
    .returning();
  return newPart;
}

// Read Parts
export async function getParts() {
  const allParts = await db.query.partStock.findMany({
    orderBy: (partStock, { asc }) => asc(partStock.part_id),
  });
  return allParts;
}

export async function getPartById(partId: number) {
  const part = await db.query.partStock.findFirst({
    where: (partStock, { eq }) => eq(partStock.part_id, partId),
  });
  return part;
}

// Update Part
export async function updatePart(
  part_id: number,
  name?: string,
  created_at?: Date,
  part_number?: string,
  condition?: string,
  length?: number,
  quantity?: number,
  location_id?: number,
  length_unit?: string,
  width?: number,
  width_unit?: string,
  height?: number,
  height_unit?: string,
  compatible_machines?: string,
) {
  const updatedPart = await db
    .update(partStock)
    .set({
      name,
      created_at,
      part_number,
      condition,
      length,
      quantity,
      location_id,
      length_unit,
      width,
      width_unit,
      height,
      height_unit,
      compatible_machines,
    })
    .where(eq(partStock.part_id, part_id))
    .returning();
  return updatedPart;
}

// Delete Part
export async function deletePart(partId: number) {
  const deletedPart = await db
    .delete(partStock)
    .where(eq(partStock.part_id, partId))
    .returning();
  return deletedPart;
}
