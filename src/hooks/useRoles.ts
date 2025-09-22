// useRoles.ts
import { useCrud } from "./useCrud";

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  users?: { id: string; first_name: string; last_name: string; username: string;};
  created_at: string;
  isSystem?: boolean;
  updated_at: string;
  userCount?: number; // Optional property to hold the number of users in this role
}

export const useRoles = () => {
  return useCrud<Role>("/roles");
};
