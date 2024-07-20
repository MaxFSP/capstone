import "server-only";

//DB stuff
import { db } from "../../db";
import { asc, eq } from "drizzle-orm";
import { toolStock, locations, toolImages } from "../../db/schema";
import { type Tool } from "~/server/types/ITool";

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
  const allTools = await db
    .select()
    .from(toolStock)
    .leftJoin(locations, eq(toolStock.location_id, locations.location_id))
    .leftJoin(toolImages, eq(toolStock.tool_id, toolImages.tool_id))
    .orderBy(asc(toolStock.tool_id));

  // Create a map to aggregate images and store tool details
  const toolMap = new Map<number, Tool>();

  allTools.forEach((row) => {
    const { tool_stock, location, tool_images } = row;
    const toolId = tool_stock.tool_id;

    // Check if the tool item already exists in the map
    if (!toolMap.has(toolId)) {
      toolMap.set(toolId, {
        ...tool_stock,
        location_name: location?.name ?? "",
        images: [],
      });
    }

    const currentTool = toolMap.get(toolId)!;

    // Add image URL if it exists
    if (tool_images?.image_url) {
      currentTool.images.push(tool_images.image_url);
    }
  });

  // Convert the map values to an array
  const toolsWithImages = Array.from(toolMap.values());

  return toolsWithImages;
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
