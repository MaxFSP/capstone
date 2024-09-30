// pages/api/createUser/route.ts

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import type { CreateUserResponse } from "~/server/types/api";
import type { CreateClerkEmployeeWithOrg } from "~/server/types/IClerkUser";
import type { AddEmployee } from "~/server/types/org";
import { createUser } from "~/server/queries/user/queries";
import type { ClerkAPIError } from "@clerk/types";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) return NextResponse.redirect("/sign-in");

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const formValues: CreateClerkEmployeeWithOrg = await req.json();

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

    // add the user to the db

    //   username: string,
    // firstName: string,
    // lastName: string,
    // imageUrl: string,
    // imageKey: string,
    // rol_id: number,
    // clerk_id: string,

    await createUser(
      formValues.username,
      formValues.firstName,
      formValues.lastName,
      "",
      "",
      formValues.organizationId,
      data.id,
    );

    return NextResponse.json({
      data: data,
      message: "User created, role assigned, and user allowed successfully",
    } as CreateUserResponse);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "errors" in error &&
      Array.isArray(error.errors)
    ) {
      const clerkError = error as { errors: ClerkAPIError[] };
      const usernameError = clerkError.errors.find(
        (e) => e.code === "form_identifier_exists"
      );
  
      if (usernameError) {
        return NextResponse.json(
          { error: usernameError.message || "That username is taken. Please try another." },
          { status: 422 }
        );
      }
    }
  
    // For any other errors
    console.error("Failed to process user:", error);
    return NextResponse.json(
      { error: "Failed to process user" },
      { status: 500 }
    );  
  }
}
