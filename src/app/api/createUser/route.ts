// pages/api/createUser/route.ts

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import type { CreateUserResponse } from "~/server/types/api";
import type { CreateEmployeeWithOrg } from "~/server/types/employee";
import type { AddEmployee } from "~/server/types/org";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) return NextResponse.redirect("/sign-in");

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const formValues: CreateEmployeeWithOrg = await req.json();

    // Create the user
    const data: User = await clerkClient.users.createUser({
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      username: formValues.username,
      emailAddress: formValues.email,
      password: formValues.password,
    });

    // Add role to the user
    const orgValues: AddEmployee = {
      userId: data.id,
      organizationId: formValues.organizationId,
      role: "org:member",
    };
    await clerkClient.organizations.createOrganizationMembership(orgValues);

    // Allow the user
    await clerkClient.allowlistIdentifiers.createAllowlistIdentifier({
      identifier: formValues.email[0]!,
      notify: false,
    });

    return NextResponse.json({
      data: data,
      message: "User created, role assigned, and user allowed successfully",
    } as CreateUserResponse);
  } catch (error) {
    console.error("Failed to process user:", error);
    return NextResponse.json(
      { error: "Failed to process user" },
      { status: 500 },
    );
  }
}
