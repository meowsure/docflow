// hooks/useHostings.ts
import { useCrud } from "./useCrud";

export interface Domain {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'expired';
  expiry_date: string;
  created_at: string;
}

export interface EmailAccount {
  id: string;
  email: string;
  quota: string;
  used: string;
  status: 'active' | 'suspended';
  last_login?: string;
}

export interface Server {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'maintenance';
  cpu: string;
  ram: string;
  storage: string;
  os: string;
  created_at: string;
  domains: Domain[];
  email_accounts: EmailAccount[];
}

export interface Hosting {
  id: string;
  name: string;
  provider: string;
  plan: string;
  status: 'active' | 'suspended' | 'pending';
  ip: string;
  login_url: string;
  username: string;
  password: string;
  expiry_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  servers: Server[];
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  stats?: {
    servers_count: number;
    domains_count: number;
    email_accounts_count: number;
  };
}

export const useHostings = () => {
  return useCrud<Hosting>("/hostings");
};