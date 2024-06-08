// pages/api/updateUser/route.ts

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import type { UpdateUserRequest, UpdateUserResponse } from "~/app/types/api";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) return NextResponse.redirect("/sign-in");

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { userId: targetUserId, formEmployee }: UpdateUserRequest =
    await req.json();

  try {
    await clerkClient.users.updateUser(targetUserId, formEmployee);
    return NextResponse.json({
      message: "User updated successfully",
    } as UpdateUserResponse);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
