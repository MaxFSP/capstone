import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function getUserName(): Promise<string> {
  const user = auth();

  if (!user.userId) throw new Error("Unauthorized");

  const userData = await currentUser();
  if (!userData) throw new Error("User not found");

  const userName: string = userData.username!;

  return userName;
}
