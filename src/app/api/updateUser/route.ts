// pages/api/updateUser/route.ts

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getAuth,
  clerkClient,
  type AllowlistIdentifier,
} from "@clerk/nextjs/server";
import type { UpdateUserRequest, UpdateUserResponse } from "~/server/types/api";
import { getOrgByUserId } from "~/server/queries/queries";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) return NextResponse.redirect("/sign-in");

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { userId: targetUserId, formEmployee }: UpdateUserRequest =
      await req.json();

    // Separate department and online from formEmployee
    const { orgId, online, ...employeeData } = formEmployee;

    // Check if there is at least a single param that's not empty in employeeData
    const hasNonEmptyFields = Object.keys(employeeData).some(
      (key) => employeeData[key as keyof typeof employeeData] !== "",
    );

    if (hasNonEmptyFields) {
      await clerkClient.users.updateUser(targetUserId, employeeData);

      if (orgId) {
        // Remove all roles
        const userOrgs = await getOrgByUserId(targetUserId);
        await clerkClient.organizations.deleteOrganizationMembership({
          organizationId: userOrgs.id,
          userId: targetUserId,
        });
        // Add the new role
        await clerkClient.organizations.createOrganizationMembership({
          organizationId: orgId,
          userId: targetUserId,
          role: "org:member",
        });
      }
      if (online !== undefined) {
        if (online == true) {
          // allowlist the user
          await clerkClient.allowlistIdentifiers.createAllowlistIdentifier({
            identifier: formEmployee.email[0]!,
            notify: false,
          });
        } else {
          const response =
            await clerkClient.allowlistIdentifiers.getAllowlistIdentifierList();
          const allowlist = response.data;

          const findIdByEmail = (
            email: string,
            allowlist: AllowlistIdentifier[],
          ) => {
            const result = allowlist.find((item) => item.identifier === email);
            return result ? result.id : null;
          };

          const id = findIdByEmail(formEmployee.email[0]!, allowlist);
          //remove from allow list
          await clerkClient.allowlistIdentifiers.deleteAllowlistIdentifier(id!);
        }
      }
    }

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
