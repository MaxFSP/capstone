export interface Employee {
  id: string;
  img: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  department: string[];
  online: boolean;
}

export interface UpdateEmployee {
  img?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  department?: string[];
}
