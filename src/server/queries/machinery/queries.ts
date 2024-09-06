import "server-only";

//DB stuff
import { db } from "../../db";
import { machineryStock, locations, machineryImages } from "../../db/schema";
import { eq, asc, count } from "drizzle-orm";
import { type Machinery } from "../../types/IMachinery";

// Machinery Stock Table --------------------------------------------------------------------------------------------

// Create Machinery
export async function createMachinery(
  brandValue: string,
  modelValue: string,
  yearValue: number,
  acquisition_dateValue: Date,
  serialNumberValue: string,
  locationIdValue: number,
  stateValue: string,
  observationsValue?: string,
) {
  const newMachinery = await db
    .insert(machineryStock)
    .values({
      brand: brandValue,
      model: modelValue,
      year: yearValue,
      acquisition_date: acquisition_dateValue,
      serial_number: serialNumberValue,
      location_id: locationIdValue,
      observations: observationsValue,
      state: stateValue,
    })
    .returning();
  return newMachinery;
}

// Read Machineries
export async function getMachineries() {
  const allMachineries = await db
    .select()
    .from(machineryStock)
    .leftJoin(locations, eq(machineryStock.location_id, locations.location_id))
    .leftJoin(
      machineryImages,
      eq(machineryStock.machine_id, machineryImages.machine_id),
    )
    .orderBy(asc(machineryStock.machine_id));

  // Create a map to aggregate images and store machinery details
  const machineryMap = new Map<number, Machinery>();

  allMachineries.forEach((row) => {
    const { machinery_stock, location, machinery_images } = row;
    const machineId = machinery_stock.machine_id;

    // Check if the machinery item already exists in the map
    if (!machineryMap.has(machineId)) {
      machineryMap.set(machineId, {
        ...machinery_stock,
        location_name: location?.name ?? "",
        images: [],
        observations: machinery_stock.observations ?? "",
      });
    }

    const currentMachinery = machineryMap.get(machineId)!;

    // Add image URL if it exists
    if (machinery_images?.image_url) {
      currentMachinery.images.push({
        image_id: machinery_images.image_id,
        image_url: machinery_images.image_url,
        image_key: machinery_images.image_key,
      });
    }
  });

  // Convert the map values to an array
  const machineryWithImages = Array.from(machineryMap.values());

  return machineryWithImages;
}

export async function getMachineryById(machineId: number) {
  const machinery = await db.query.machineryStock.findFirst({
    where: (machineryStock, { eq }) => eq(machineryStock.machine_id, machineId),
  });
  return machinery;
}

// Update Machinery
export async function updateMachinery(
  machineId: number,
  brandValue?: string,
  modelValue?: string,
  yearValue?: number,
  serialNumberValue?: string,
  locationIdValue?: number,
  stateValue?: string,
  observationsValue?: string,
) {
  const updatedMachinery = await db
    .update(machineryStock)
    .set({
      brand: brandValue,
      model: modelValue,
      year: yearValue,
      serial_number: serialNumberValue,
      location_id: locationIdValue,
      state: stateValue,
      observations: observationsValue,
    })
    .where(eq(machineryStock.machine_id, machineId))
    .returning();
  return updatedMachinery;
}

// Sell Machinery
export async function sellMachinery(
  machineId: number,
  sold_dateValue: Date,
  sold_priceValue: number,
  sold_toValue: string,
) {
  const updatedMachinery = await db
    .update(machineryStock)
    .set({
      sold_date: sold_dateValue,
      sold_price: sold_priceValue,
      sold_to: sold_toValue,
      state: "Sold",
    })
    .where(eq(machineryStock.machine_id, machineId))
    .returning();
  return updatedMachinery;
}

// Delete Machinery
export async function deleteMachinery(machineId: number) {
  const deletedMachinery = await db
    .delete(machineryStock)
    .where(eq(machineryStock.machine_id, machineId))
    .returning();
  return deletedMachinery;
}

export async function deleteImageMachinery(imageId: number) {
  const deletedImage = await db
    .delete(machineryImages)
    .where(eq(machineryImages.image_id, imageId))
    .returning();
  return deletedImage;
}

export async function totalMachines() {
  const totalMachines = await db
    .select({ count: count() })
    .from(machineryStock);
  if (totalMachines.length > 0) {
    const numberOfMachines: number = totalMachines[0]!.count;
    return numberOfMachines;
  }
  const numberOfMachines = 0;

  return numberOfMachines;
}
