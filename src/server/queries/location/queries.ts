import "server-only";

//DB stuff
import { db } from "../../db";
import { locations } from "../../db/schema";
import { eq } from "drizzle-orm";

// Locations Table  --------------------------------------------------------------------------------------------

// Create Location
export async function createLocation(name: string, address: string) {
  const newLocation = await db
    .insert(locations)
    .values({
      name,
      address,
    })
    .returning();
  return newLocation;
}

// Read Locations
export async function getLocations() {
  const allLocations = await db.query.locations.findMany({
    orderBy: (locations, { asc }) => asc(locations.location_id),
  });
  return allLocations;
}

export async function getLocationById(locationId: number) {
  const location = await db.query.locations.findFirst({
    where: (locations, { eq }) => eq(locations.location_id, locationId),
  });
  return location;
}

// Update Location
export async function updateLocation(
  locationId: number,
  name?: string,
  address?: string,
) {
  const updatedLocation = await db
    .update(locations)
    .set({ name, address })
    .where(eq(locations.location_id, locationId))
    .returning();
  return updatedLocation;
}

// Delete Location
export async function deleteLocation(locationId: number) {
  const deletedLocation = await db
    .delete(locations)
    .where(eq(locations.location_id, locationId))
    .returning();
  return deletedLocation;
}
