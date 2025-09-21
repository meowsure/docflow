// useShipments.ts
import { useCrud } from "./useCrud";

export interface Shipment {
  id: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useShipments = () => {
  return useCrud<Shipment>("/shipments");
};
