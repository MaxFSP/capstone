export interface UpdateUserRequest {
  userId: string;
  formEmployee: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    department: string[];
  };
}

export interface UpdateUserResponse {
  message: string;
  error?: string;
}
