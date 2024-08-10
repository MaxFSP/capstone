export interface Employee {
  employee_id: number;
  firstName: string;
  lastName: string;
  age: number;
  imageUrl: string;
  hireDate: Date;
  phoneNumber: string;
  job: string;
  bloodType: string;
  imageKey: string;
}

export interface CreateEmployee {
  firstName: string;
  lastName: string;
  age: number;
  hireDate: Date;
  phoneNumber: string;
  job: string;
  bloodType: string;
}

export interface UpdateEmployee {
  employee_id: number;
  firstName?: string;
  lastName?: string;
  age?: number;
  imageUrl?: string;
  hireDate?: Date;
  phoneNumber?: string;
  job?: string;
  bloodType?: string;
  imageKey: string;
}
