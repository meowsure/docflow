// useUsers.ts
import { useCrud } from "./useCrud";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: string;
}

export const useUsers = () => {
  return useCrud<User>("/users");
};
