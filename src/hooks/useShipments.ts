// useShipments.ts
import { useCrud } from "./useCrud";

export interface Shipment {
  id: string;
  external_id: string;
  status: string;
  from_location?: string;
  to_location?: string;
  planned_date?: string;
  actual_date?: string;
  items?: any[];
  address: string;
  work_schedule?: string;
  request_code?: string;
  loading_contacts?: string;
  shop_name?: string;
  goods_name: string;
  goods_volume?: string;
  goods_weight?: string;
  goods_package?: string;
  contract_number: string;
  loading_date?: string;
  loading_requirements?: string;
  additional_info?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator: Array<{ id: string; username: string; telegram_id: string; first_name: string; last_name: string; photo_url?: string; full_name: string }>;
  files?: string[];
}

export const useShipments = () => {
  return useCrud<Shipment>("/shipments");
};
