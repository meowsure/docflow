// types/hosting.ts
export interface Domain {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'expired';
  expiryDate: string;
  createdAt: string;
}

export interface EmailAccount {
  id: string;
  email: string;
  quota: string;
  used: string;
  status: 'active' | 'suspended';
  lastLogin?: string;
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
  domains: Domain[];
  emailAccounts: EmailAccount[];
  createdAt: string;
}

export interface Hosting {
  id: string;
  name: string;
  provider: string;
  plan: string;
  status: 'active' | 'suspended' | 'pending';
  ip: string;
  loginUrl: string;
  username: string;
  password: string;
  servers: Server[];
  createdAt: string;
  expiryDate: string;
}