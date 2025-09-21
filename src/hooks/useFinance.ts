// useFinance.ts
import { useCrud } from "./useCrud";

export interface Invoice {
  id: string;
  amount: number;
  status: string;
  due_date: string;
  created_at: string;
}

export const useFinance = () => {
  return useCrud<Invoice>("/invoices");
};
