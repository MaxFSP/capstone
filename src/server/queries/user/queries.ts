import "server-only";

//DB stuff
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

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
  username?: string,
  firstName?: string,
  lastName?: string,
  profileImageUrl?: string,
  rolId?: number,
  clerkId?: string,
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
