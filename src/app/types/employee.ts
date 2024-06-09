import { Org } from "./org";

export interface BaseEmployee {
  firstName: string;
  lastName: string;
  username: string;
  email: string[];
  online?: boolean;
}

export interface CreateEmployee extends BaseEmployee {
  password: string;
}

export interface UpdateEmployee {
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string[];
  orgId?: string;
  online?: boolean;
  password?: string;
}

export interface Employee extends BaseEmployee {
  id: string;
  img: string;
  org: Org;
}

export interface CreateEmployeeWithOrg extends CreateEmployee {
  organizationId: string;
}
