// useRoles.ts
import { useCrud } from "./useCrud";

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  users: { id: string; first_name: string; last_name: string; username: string; photo_url: string }[];
  created_at: string;
  updated_at: string;
}

export const useRoles = () => {
  return useCrud<Role>("/roles");
};
