import "server-only";

import {
  type AllowlistIdentifier,
  auth,
  currentUser,
} from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import type { Employee } from "~/server/types/employee";
import type { Org, EmployeeInOrg } from "~/server/types/org";

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

  const transformedUsers: Employee[] = await Promise.all(
    users.data.map(async (user) => {
      const id = user.id;
      const email = user.emailAddresses[0]?.emailAddress ?? "Unknown";
      const status = await userStatus(email);
      const currentOrg = await getOrgByUserId(id);

      return {
        id: id,
        img: user.imageUrl,
        firstName: user.firstName ?? "Unknown",
        lastName: user.lastName ?? "Unknown",
        username: user.username ?? "Unknown",
        email: [email],
        org: currentOrg,
        online: status,
      };
    }),
  );

  return transformedUsers;
}

export async function getUserByIdClerk(id: string): Promise<Employee> {
  const userf = auth();

  if (!userf.userId) throw new Error("Unauthorized");

  const user = await clerkClient.users.getUser(id);
  const transformedUser: Employee = {
    id: user.id,
    img: user.imageUrl,
    firstName: user.firstName ?? "Unknown",
    lastName: user.lastName ?? "Unknown",
    username: user.username ?? "Unknown",
    email: [user.emailAddresses[0]!.emailAddress] ?? ["Unknown"],
    org: await getOrgByUserId(id),
  };

  const status = await userStatus(transformedUser.email[0]!);
  transformedUser.online = status;

  return transformedUser;
}

export async function getAllOrgs(): Promise<Org[]> {
  const user = auth();

  if (!user.userId) throw new Error("Unauthorized");

  const orgs = await clerkClient.organizations.getOrganizationList();

  const orgId: Org[] = orgs.data.map((org) => ({ id: org.id, name: org.name }));

  return orgId;
}

export async function getMembersFromOrg(
  orgId: string,
): Promise<EmployeeInOrg[]> {
  const user = auth();

  if (!user.userId) throw new Error("Unauthorized");

  const org = await clerkClient.organizations.getOrganizationMembershipList({
    organizationId: orgId,
  });

  const members: EmployeeInOrg[] =
    org?.data?.map((member) => ({
      orgId: member.organization.id,
      userId: member.publicUserData!.userId,
    })) || [];
  return members;
}

export async function getOrgByUserId(userId: string): Promise<Org> {
  const user = auth();

  if (!user.userId) throw new Error("Unauthorized");

  const allOrgs = await getAllOrgs();
  const orgs: Org[] = [];

  for (const org of allOrgs) {
    const members = await getMembersFromOrg(org.id);
    if (members.some((member) => member.userId === userId)) {
      orgs.push(org);
    }
  }
  if (orgs.length > 1) {
    return orgs[1]!;
  }

  return orgs[0]!;
}

export async function userStatus(email: string): Promise<boolean> {
  const response =
    await clerkClient.allowlistIdentifiers.getAllowlistIdentifierList();
  const allowlist = response.data;
  const findIdByEmail = (email: string, allowlist: AllowlistIdentifier[]) => {
    const result = allowlist.find((item) => item.identifier === email);
    return result ? result.id : null;
  };

  const status = findIdByEmail(email, allowlist);
  if (status !== null) {
    return true;
  }
  return false;
}
