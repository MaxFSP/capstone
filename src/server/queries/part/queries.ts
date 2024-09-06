import "server-only";

//DB stuff
import { db } from "../../db";
import { locations, partImages, partStock } from "../../db/schema";
import { eq, asc, count } from "drizzle-orm";
import { type Part } from "~/server/types/IPart";

// Part Stock Table --------------------------------------------------------------------------------------------

// Create Part
export async function createPart(
  name: string,
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
  // const allParts = await db.query.partStock.findMany({
  //   orderBy: (partStock, { asc }) => asc(partStock.part_id),
  // });
  // return allParts;

  const allParts = await db
    .select()
    .from(partStock)
    .leftJoin(locations, eq(partStock.location_id, locations.location_id))
    .leftJoin(partImages, eq(partStock.part_id, partImages.part_id))
    .orderBy(asc(partStock.part_id));

  // Create a map to aggregate images and store machinery details
  const partMap = new Map<number, Part>();

  allParts.forEach((row) => {
    const { part_stock, location, part_images } = row;
    const partId = part_stock.part_id;

    // Check if the machinery item already exists in the map
    if (!partMap.has(partId)) {
      partMap.set(partId, {
        ...part_stock,
        location_name: location?.name ?? "",
        images: [],
        compatible_machines: part_stock.compatible_machines ?? "",
      });
    }

    const currentPart = partMap.get(partId)!;

    // Add image URL if it exists
    if (part_images?.image_url) {
      currentPart.images.push({
        image_id: part_images.image_id,
        image_url: part_images.image_url,
        image_key: part_images.image_key,
      });
    }
  });

  // Convert the map values to an array
  const machineryWithImages = Array.from(partMap.values());

  return machineryWithImages;
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
  nameValue?: string,
  partNumberValue?: string,
  conditionValue?: string,
  lengthValue?: number,
  quantityValue?: number,
  locationIdValue?: number,
  lengthUnitValue?: string,
  widthValue?: number,
  widthUnitValue?: string,
  heightValue?: number,
  heightUnitValue?: string,
  compatibleMachinesValue?: string,
) {
  const updatedPart = await db
    .update(partStock)
    .set({
      name: nameValue,
      part_number: partNumberValue,
      condition: conditionValue,
      quantity: quantityValue,
      location_id: locationIdValue,
      length: lengthValue,
      length_unit: lengthUnitValue,
      width: widthValue,
      width_unit: widthUnitValue,
      height: heightValue,
      height_unit: heightUnitValue,
      compatible_machines: compatibleMachinesValue,
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

export async function deleteImagePart(imageId: number) {
  const deletedImage = await db
    .delete(partImages)
    .where(eq(partImages.image_id, imageId))
    .returning();
  return deletedImage;
}

export async function totalParts() {
  const totalParts = await db.select({ count: count() }).from(partStock);
  if (totalParts.length > 0) {
    const numberOfParts: number = totalParts[0]!.count;
    return numberOfParts;
  }
  const numberOfParts = 0;

  return numberOfParts;
}
