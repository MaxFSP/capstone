import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import type {
  CreateEmployee,
  Employee,
  UpdateEmployee,
} from "~/app/types/employee";
import type { Org, EmployeeInOrg } from "~/app/types/org";
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
    firstName: user.firstName ?? "Unknown",
    lastName: user.lastName ?? "Unknown",
    username: user.username ?? "Unknown",
    email: [user.emailAddresses[0]!.emailAddress] ?? ["Unknown"],
    department: ["Unknown", "Unknown"],
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
    firstName: user.firstName ?? "Unknown",
    lastName: user.lastName ?? "Unknown",
    username: user.username ?? "Unknown",
    email: [user.emailAddresses[0]!.emailAddress] ?? ["Unknown"],
    department: ["Unknown", "Unknown"],
    online: true,
  };

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

export async function getOrgByUserId(userId: string): Promise<Org[]> {
  const user = auth();

  if (!user.userId) throw new Error("Unauthorized");

  const allOrgs = await getAllOrgs();
  const userOrgs: Org[] = [];

  for (const org of allOrgs) {
    const members = await getMembersFromOrg(org.id);
    if (members.some((member) => member.userId === userId)) {
      userOrgs.push(org);
    }
  }

  return userOrgs;
}

export async function updateUser(
  userId: string,
  formEmployee: UpdateEmployee,
): Promise<void> {
  const user = auth();
  if (!user.userId) throw new Error("Unauthorized");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  await clerkClient.users.updateUser(userId, formEmployee);
}

export async function createUser(newUser: CreateEmployee): Promise<void> {
  const user = auth();
  if (!user.userId) throw new Error("Unauthorized");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  await clerkClient.users.createUser(newUser);
}
