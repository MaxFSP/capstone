import 'server-only';

//DB stuff
import { db } from '../../db';

import { roles } from '../../db/schema';
import { eq } from 'drizzle-orm';

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
export async function updateRole(rolId: number, rolName?: string) {
  const updatedRole = await db
    .update(roles)
    .set({ rol_name: rolName })
    .where(eq(roles.rol_id, rolId))
    .returning();
  return updatedRole;
}

// Delete Role
export async function deleteRole(rolId: number) {
  const deletedRole = await db.delete(roles).where(eq(roles.rol_id, rolId)).returning();
  return deletedRole;
}
