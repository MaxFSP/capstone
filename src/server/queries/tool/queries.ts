import "server-only";

//DB stuff
import { db } from "../../db";
import { toolStock } from "../../db/schema";
import { eq } from "drizzle-orm";

// Tool Stock Table --------------------------------------------------------------------------------------------

// Create Tool
export async function createTool(
  name: string,
  condition: string,
  quantity: number,
  location_id: number,
  created_at: Date,
  category: string,
  tool_type: string,
  acquisition_date: Date,
  observations?: string,
) {
  const newTool = await db
    .insert(toolStock)
    .values({
      name,
      condition,
      quantity,
      location_id,
      created_at,
      category,
      tool_type,
      acquisition_date,
      observations,
    })
    .returning();
  return newTool;
}

// Read Tools
export async function getTools() {
  const allTools = await db.query.toolStock.findMany({
    orderBy: (toolStock, { asc }) => asc(toolStock.tool_id),
  });
  return allTools;
}

export async function getToolById(toolId: number) {
  const tool = await db.query.toolStock.findFirst({
    where: (toolStock, { eq }) => eq(toolStock.tool_id, toolId),
  });
  return tool;
}

// Update Tool
export async function updateTool(
  tool_id: number,
  name?: string,
  created_at?: Date,
  condition?: string,
  quantity?: number,
  location_id?: number,
  category?: string,
  tool_type?: string,
  acquisition_date?: Date,
  observations?: string,
) {
  const updatedTool = await db
    .update(toolStock)
    .set({
      name,
      created_at,
      condition,
      quantity,
      location_id,
      category,
      tool_type,
      acquisition_date,
      observations,
    })
    .where(eq(toolStock.tool_id, tool_id))
    .returning();
  return updatedTool;
}

// Delete Tool
export async function deleteTool(toolId: number) {
  const deletedTool = await db
    .delete(toolStock)
    .where(eq(toolStock.tool_id, toolId))
    .returning();
  return deletedTool;
}
