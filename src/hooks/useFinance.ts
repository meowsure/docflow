// useFinance.ts
import { useCrud } from "./useCrud";

export interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  createdDate: string;
  items?: any;
  description?: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  method: string;
  paid_at: string | null;
}

export const useFinance = () => {
  return useCrud<Invoice>("/invoices");
};
