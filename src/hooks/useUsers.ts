// useUsers.ts
import { useCrud } from "./useCrud";

export interface User {
  id: string;
  telegram_id: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  photo_url: string;
  email: string;
  role_id: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  } | null;
  created_at: string;
  updated_at: string;
}

export const useUsers = () => {
  return useCrud<User>("/users");
};
