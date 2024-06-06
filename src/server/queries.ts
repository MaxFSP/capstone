import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import type { Employee } from "~/app/types/employee";

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
  const transformedUser: Employee[] = users.data.map((user) => ({
    id: user.id,
    img: user.imageUrl,
    name: user.username ?? "Unknown",
    email: user.emailAddresses[0]?.emailAddress ?? "Unknown",
    job: ["Unknown", "Unknown"],
    online: true,
  }));

  return transformedUser;
}

export async function getUserById(id: string): Promise<Employee> {
  const userf = auth();

  if (!userf.userId) throw new Error("Unauthorized");

  const user = await clerkClient.users.getUser(id);
  const transformedUser: Employee = {
    id: user.id,
    img: user.imageUrl,
    name: user.username ?? "Unknown",
    email: user.emailAddresses[0]?.emailAddress ?? "Unknown",
    job: ["Unknown", "Unknown"],
    online: true,
  };

  return transformedUser;
}
