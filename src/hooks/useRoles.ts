// useRoles.ts
import { useCrud } from "./useCrud";

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export const useRoles = () => {
  return useCrud<Role>("/roles");
};
