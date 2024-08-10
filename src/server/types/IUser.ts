export interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  imageUrl: string | null;
  imageKey: string | null;
  rol_id: number;
  clerk_id: string;
}

export interface CreateUser {
  username: string;
  first_name: string;
  last_name: string;
  imageUrl: string;
  imageKey: string;
  rol_id: string;
  clerk_id: string;
}

export interface UpdateUser {
  user_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  imageUrl?: string;
  imageKey?: string;
  rol_id?: string;
  clerk_id?: string;
}
