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
  img?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string[];
  department?: string[];
  online?: boolean;
  password?: string;
}

export interface Employee extends BaseEmployee {
  id: string;
  img: string;
  department: string[];
  online: boolean;
}

export interface CreateEmployeeWithOrg extends CreateEmployee {
  organizationId: string;
}