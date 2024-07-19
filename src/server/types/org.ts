export interface Org {
  id: string;
  name: string;
}

export interface EmployeeInOrg {
  orgId: string;
  userId: string;
}

export interface AddEmployee {
  organizationId: string;
  userId: string;
  role: string;
}
