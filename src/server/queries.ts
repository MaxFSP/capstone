import "server-only";

import {
  type AllowlistIdentifier,
  auth,
  currentUser,
} from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import type { Employee } from "~/app/types/employee";
import type { Org, EmployeeInOrg } from "~/app/types/org";

//DB stuff
import { db } from "./db";
import {
  roles,
  fixes,
  machineryStock,
  users,
  toolStock,
  partStock,
  repairOrders,
  locations,
} from "./db/schema";
import { eq } from "drizzle-orm";

// Roles Table --------------------------------------------------------------------------------------------

// Create Role
export async function createRole(rolName: string) {
  const newRole = await db
    .insert(roles)
    .values({
      rol_name: rolName,
    })
    .returning();
  return newRole;
}

// Read Roles
export async function getRoles() {
  const allRoles = await db.query.roles.findMany({
    orderBy: (roles, { asc }) => asc(roles.rol_id),
  });
  return allRoles;
}

export async function getRoleById(rolId: number) {
  const role = await db.query.roles.findFirst({
    where: (roles, { eq }) => eq(roles.rol_id, rolId),
  });
  return role;
}

// Update Role
export async function updateRole(rolId: number, rolName: string) {
  const updatedRole = await db
    .update(roles)
    .set({ rol_name: rolName })
    .where(eq(roles.rol_id, rolId))
    .returning();
  return updatedRole;
}

// Delete Role
export async function deleteRole(rolId: number) {
  const deletedRole = await db
    .delete(roles)
    .where(eq(roles.rol_id, rolId))
    .returning();
  return deletedRole;
}

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
  name: string,
  partId: number,
  toolId: number,
  machineId: number,
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

// Machinery Stock Table --------------------------------------------------------------------------------------------

// Create Machinery
export async function createMachinery(
  brand: string,
  model: string,
  licensePlate: string,
  acquisitionDate: Date,
  serialNumber: string,
  locationId: number,
  comments?: string,
) {
  const newMachinery = await db
    .insert(machineryStock)
    .values({
      brand,
      model,
      license_plate: licensePlate,
      accquisition_date: acquisitionDate,
      serial_number: serialNumber,
      location_id: locationId,
      comments,
    })
    .returning();
  return newMachinery;
}

// Read Machineries
export async function getMachineries() {
  const allMachineries = await db.query.machineryStock.findMany({
    orderBy: (machineryStock, { asc }) => asc(machineryStock.machine_id),
  });
  return allMachineries;
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
  brand: string,
  model: string,
  licensePlate: string,
  acquisitionDate: Date,
  serialNumber: string,
  locationId: number,
  comments?: string,
) {
  const updatedMachinery = await db
    .update(machineryStock)
    .set({
      brand,
      model,
      license_plate: licensePlate,
      accquisition_date: acquisitionDate,
      serial_number: serialNumber,
      location_id: locationId,
      comments,
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

// Users Table --------------------------------------------------------------------------------------------

// Create User
export async function createUser(
  username: string,
  firstName: string,
  lastName: string,
  profileImageUrl: string,
  rolId: number,
  clerkId: string,
) {
  const newUser = await db
    .insert(users)
    .values({
      username,
      first_name: firstName,
      last_name: lastName,
      profile_image_url: profileImageUrl,
      rol_id: rolId,
      clerk_id: clerkId,
    })
    .returning();
  return newUser;
}

// Read Users
export async function getUsers() {
  const allUsers = await db.query.users.findMany({
    orderBy: (users, { asc }) => asc(users.user_id),
  });
  return allUsers;
}

export async function getUserById(userId: number) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.user_id, userId),
  });
  return user;
}

// Update User
export async function updateUser(
  userId: number,
  username: string,
  firstName: string,
  lastName: string,
  profileImageUrl: string,
  rolId: number,
  clerkId: string,
) {
  const updatedUser = await db
    .update(users)
    .set({
      username,
      first_name: firstName,
      last_name: lastName,
      profile_image_url: profileImageUrl,
      rol_id: rolId,
      clerk_id: clerkId,
    })
    .where(eq(users.user_id, userId))
    .returning();
  return updatedUser;
}

// Delete User
export async function deleteUser(userId: number) {
  const deletedUser = await db
    .delete(users)
    .where(eq(users.user_id, userId))
    .returning();
  return deletedUser;
}

// Tool Stock Table --------------------------------------------------------------------------------------------

// Create Tool
export async function createTool(
  name: string,
  usage: string,
  quantity: number,
  locationId: number,
) {
  const newTool = await db
    .insert(toolStock)
    .values({
      name,
      usage,
      quantity,
      location_id: locationId,
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
  toolId: number,
  name: string,
  usage: string,
  quantity: number,
  locationId: number,
) {
  const updatedTool = await db
    .update(toolStock)
    .set({ name, usage, quantity, location_id: locationId })
    .where(eq(toolStock.tool_id, toolId))
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

// Part Stock Table --------------------------------------------------------------------------------------------

// Create Part
export async function createPart(
  name: string,
  usage: string,
  quantity: number,
  locationId: number,
) {
  const newPart = await db
    .insert(partStock)
    .values({
      name,
      usage,
      quantity,
      location_id: locationId,
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
  partId: number,
  name: string,
  usage: string,
  quantity: number,
  locationId: number,
) {
  const updatedPart = await db
    .update(partStock)
    .set({ name, usage, quantity, location_id: locationId })
    .where(eq(partStock.part_id, partId))
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

// Repair Orders Table --------------------------------------------------------------------------------------------

// Create Repair Order
export async function createRepairOrder(
  name: string,
  userId: number,
  fixId: number,
) {
  const newRepairOrder = await db
    .insert(repairOrders)
    .values({
      name,
      user_id: userId,
      fix_id: fixId,
    })
    .returning();
  return newRepairOrder;
}

// Read Repair Orders
export async function getRepairOrders() {
  const allRepairOrders = await db.query.repairOrders.findMany({
    orderBy: (repairOrders, { asc }) => asc(repairOrders.order_id),
  });
  return allRepairOrders;
}

export async function getRepairOrderById(orderId: number) {
  const repairOrder = await db.query.repairOrders.findFirst({
    where: (repairOrders, { eq }) => eq(repairOrders.order_id, orderId),
  });
  return repairOrder;
}

// Update Repair Order
export async function updateRepairOrder(
  orderId: number,
  name: string,
  userId: number,
  fixId: number,
) {
  const updatedRepairOrder = await db
    .update(repairOrders)
    .set({ name, user_id: userId, fix_id: fixId })
    .where(eq(repairOrders.order_id, orderId))
    .returning();
  return updatedRepairOrder;
}

// Delete Repair Order
export async function deleteRepairOrder(orderId: number) {
  const deletedRepairOrder = await db
    .delete(repairOrders)
    .where(eq(repairOrders.order_id, orderId))
    .returning();
  return deletedRepairOrder;
}

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
  name: string,
  address: string,
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

//other queries --------------------------------------------------------------------------------------------

//user and auth queries
export async function getUserName(): Promise<string> {
  const user = auth();

  if (!user.userId) throw new Error("Unauthorized");

  const userData = await currentUser();
  if (!userData) throw new Error("User not found");

  const userName: string = userData.username!;

  return userName;
}

export async function getActiveOrg(): Promise<string> {
  const user = auth();

  if (!user.userId) throw new Error("Unauthorized");

  const userOrg = user.orgSlug;
  if (!userOrg) return "Null";

  return userOrg;
}

export async function getAllUsers(): Promise<Employee[]> {
  const user = auth();

  if (!user.userId) throw new Error("Unauthorized");

  const users = await clerkClient.users.getUserList();

  const transformedUsers: Employee[] = await Promise.all(
    users.data.map(async (user) => {
      const id = user.id;
      const email = user.emailAddresses[0]?.emailAddress ?? "Unknown";
      const status = await userStatus(email);
      const currentOrg = await getOrgByUserId(id);

      return {
        id: id,
        img: user.imageUrl,
        firstName: user.firstName ?? "Unknown",
        lastName: user.lastName ?? "Unknown",
        username: user.username ?? "Unknown",
        email: [email],
        org: currentOrg,
        online: status,
      };
    }),
  );

  return transformedUsers;
}

export async function getUserByIdClerk(id: string): Promise<Employee> {
  const userf = auth();

  if (!userf.userId) throw new Error("Unauthorized");

  const user = await clerkClient.users.getUser(id);
  const transformedUser: Employee = {
    id: user.id,
    img: user.imageUrl,
    firstName: user.firstName ?? "Unknown",
    lastName: user.lastName ?? "Unknown",
    username: user.username ?? "Unknown",
    email: [user.emailAddresses[0]!.emailAddress] ?? ["Unknown"],
    org: await getOrgByUserId(id),
  };

  const status = await userStatus(transformedUser.email[0]!);
  transformedUser.online = status;

  return transformedUser;
}

export async function getAllOrgs(): Promise<Org[]> {
  const user = auth();

  if (!user.userId) throw new Error("Unauthorized");

  const orgs = await clerkClient.organizations.getOrganizationList();

  const orgId: Org[] = orgs.data.map((org) => ({ id: org.id, name: org.name }));

  return orgId;
}

export async function getMembersFromOrg(
  orgId: string,
): Promise<EmployeeInOrg[]> {
  const user = auth();

  if (!user.userId) throw new Error("Unauthorized");

  const org = await clerkClient.organizations.getOrganizationMembershipList({
    organizationId: orgId,
  });

  const members: EmployeeInOrg[] =
    org?.data?.map((member) => ({
      orgId: member.organization.id,
      userId: member.publicUserData!.userId,
    })) || [];
  return members;
}

export async function getOrgByUserId(userId: string): Promise<Org> {
  const user = auth();

  if (!user.userId) throw new Error("Unauthorized");

  const allOrgs = await getAllOrgs();
  const orgs: Org[] = [];

  for (const org of allOrgs) {
    const members = await getMembersFromOrg(org.id);
    if (members.some((member) => member.userId === userId)) {
      orgs.push(org);
    }
  }
  if (orgs.length > 1) {
    return orgs[1]!;
  }

  return orgs[0]!;
}

export async function userStatus(email: string): Promise<boolean> {
  const response =
    await clerkClient.allowlistIdentifiers.getAllowlistIdentifierList();
  const allowlist = response.data;
  const findIdByEmail = (email: string, allowlist: AllowlistIdentifier[]) => {
    const result = allowlist.find((item) => item.identifier === email);
    return result ? result.id : null;
  };

  const status = findIdByEmail(email, allowlist);
  if (status !== null) {
    return true;
  }
  return false;
}
