import { useEffect, useState } from "react";
import api from "@/api";

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

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/invoices"); // index()
      setInvoices(data.data);
    } finally {
      setLoading(false);
    }
  };

  const getInvoice = async (id: string) => {
    const { data } = await api.get(`/invoices/${id}`); // show()
    return data as Invoice;
  };

  const createInvoice = async (payload: Partial<Invoice>) => {
    const { data } = await api.post("/invoices", payload);
    await fetchInvoices();
    return data;
  };

  const addPayment = async (invoiceId: string, payload: Partial<Payment>) => {
    const { data } = await api.post(`/invoices/${invoiceId}/payments`, payload);
    await fetchInvoices();
    return data;
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return { invoices, loading, fetchInvoices, getInvoice, createInvoice, addPayment };
};
