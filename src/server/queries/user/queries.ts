import 'server-only';

//DB stuff
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

// Users Table --------------------------------------------------------------------------------------------

// Create User
export async function createUser(
  username: string,
  firstName: string,
  lastName: string,
  imageUrl: string,
  imageKey: string,
  clerkRole: string,
  clerk_id: string
) {
  const newUser = await db
    .insert(users)
    .values({
      username: username,
      first_name: firstName,
      last_name: lastName,
      imageUrl: imageUrl,
      imageKey: imageKey,
      clerkRole: clerkRole,
      clerk_id: clerk_id,
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
  user_id: number,
  username?: string,
  firstName?: string,
  lastName?: string,
  imageUrl?: string,
  imageKey?: string,
  clerkRole?: string,
  clerk_id?: string
) {
  const updatedUser = await db
    .update(users)
    .set({
      username: username,

      first_name: firstName,
      last_name: lastName,
      imageUrl: imageUrl,
      imageKey: imageKey,
      clerkRole: clerkRole,
      clerk_id: clerk_id,
    })

    .where(eq(users.user_id, user_id))
    .returning();
  return updatedUser;
}

// Delete User
export async function deleteUser(userId: number) {
  const deletedUser = await db.delete(users).where(eq(users.user_id, userId)).returning();
  return deletedUser;
}

export async function deleteImageUser(user_id: number) {
  await db
    .update(users)
    .set({
      imageUrl: null,
      imageKey: null,
    })
    .where(eq(users.user_id, user_id))
    .returning();
}

export async function addImageToUser(user_id: number, imageUrl: string, imageKey: string) {
  await db
    .update(users)
    .set({
      imageUrl: imageUrl,
      imageKey: imageKey,
    })
    .where(eq(users.user_id, user_id))
    .returning();
}

export async function getUserByClerkId(clerk_id: string) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerk_id, clerk_id),
  });
  return user;
}
