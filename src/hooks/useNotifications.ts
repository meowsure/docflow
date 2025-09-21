// useNotifications.ts
import { useCrud } from "./useCrud";

export interface Notification {
  id: string;
  message: string;
  type: string;
  read_at?: string;
  created_at: string;
}

export const useNotifications = () => {
  return useCrud<Notification>("/notifications");
};
