// useLogs.ts
import { useCrud } from "./useCrud";

export interface Log {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  meta: Record<string, any>; // Изменено с string на Record<string, any>
  ip: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    email?: string;
  };
}

export const useLogs = () => {
  return useCrud<Log>("/logs");
};