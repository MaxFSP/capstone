import { type Org } from "./org";

export interface BaseClerkUser {
  firstName: string;
  lastName: string;
  username: string;
  email: string[];
  online?: boolean;
}

export interface CreateClerkUser extends BaseClerkUser {
  password: string;
}

export interface UpdateClerkUser {
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string[];
  orgId?: string;
  online?: boolean;
  password?: string;
}

export interface ClerkUser extends BaseClerkUser {
  id: string;
  img: string;
  org: Org;
}

export interface CreateClerkEmployeeWithOrg extends CreateClerkUser {
  organizationId: string;
}
