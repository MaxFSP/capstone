import "server-only";

//DB stuff
import { db } from "../../db";
import { machineryStock, locations, machineryImages } from "../../db/schema";
import { eq, asc } from "drizzle-orm";
import { type Machinery } from "../../types/IMachinery";

// Machinery Stock Table --------------------------------------------------------------------------------------------

// Create Machinery
export async function createMachinery(
  brand: string,
  model: string,
  year: number,
  acquisition_date: Date,
  serialNumber: string,
  locationId: number,
  state: string,
  observations?: string,
) {
  const newMachinery = await db
    .insert(machineryStock)
    .values({
      brand,
      model,
      year,
      acquisition_date: acquisition_date,
      serial_number: serialNumber,
      location_id: locationId,
      observations,
      state,
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
      });
    }

    const currentMachinery = machineryMap.get(machineId)!;

    // Add image URL if it exists
    if (machinery_images?.image_url) {
      currentMachinery.images.push(machinery_images.image_url);
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
  brand?: string,
  model?: string,
  year?: number,
  acquisitionDate?: Date,
  serialNumber?: string,
  locationId?: number,
  observations?: string,
) {
  const updatedMachinery = await db
    .update(machineryStock)
    .set({
      brand,
      model,
      year: year,
      acquisition_date: acquisitionDate,
      serial_number: serialNumber,
      location_id: locationId,
      observations: observations,
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
