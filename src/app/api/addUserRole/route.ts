// pages/api/addUserRole/route.ts

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import type { CreateUserResponse } from "~/server/types/api";
import type { AddEmployee } from "~/server/types/org";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) return NextResponse.redirect("/sign-in");

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const orgValues: AddEmployee = await req.json();

    await clerkClient.organizations.createOrganizationMembership(orgValues);

    return NextResponse.json({
      message: "User updated successfully",
    } as CreateUserResponse);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
