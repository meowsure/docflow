// data/mockHostings.ts
import { Hosting } from '@/types/hosting';

export const mockHostings: Hosting[] = [
  {
    id: '1',
    name: 'Основной хостинг',
    provider: 'TimeWeb',
    plan: 'Бизнес',
    status: 'active',
    ip: '192.168.1.100',
    loginUrl: 'https://timeweb.com/ru/login',
    username: 'admin',
    password: 'password123',
    expiryDate: '2024-12-31',
    createdAt: '2023-01-15',
    servers: [
      {
        id: '1-1',
        name: 'Web Server 01',
        ip: '192.168.1.101',
        status: 'online',
        cpu: '4 ядра',
        ram: '8GB',
        storage: '500GB SSD',
        os: 'Ubuntu 20.04',
        createdAt: '2023-01-15',
        domains: [
          {
            id: 'd1',
            name: 'mysite.com',
            status: 'active',
            expiryDate: '2024-12-31',
            createdAt: '2023-01-15'
          },
          {
            id: 'd2',
            name: 'shop.mysite.com',
            status: 'active',
            expiryDate: '2024-12-31',
            createdAt: '2023-03-20'
          }
        ],
        emailAccounts: [
          {
            id: 'e1',
            email: 'admin@mysite.com',
            quota: '5GB',
            used: '2.1GB',
            status: 'active',
            lastLogin: '2024-01-15T10:30:00Z'
          },
          {
            id: 'e2',
            email: 'support@mysite.com',
            quota: '2GB',
            used: '0.5GB',
            status: 'active',
            lastLogin: '2024-01-14T15:45:00Z'
          }
        ]
      },
      {
        id: '1-2',
        name: 'DB Server 01',
        ip: '192.168.1.102',
        status: 'online',
        cpu: '8 ядер',
        ram: '16GB',
        storage: '1TB SSD',
        os: 'CentOS 8',
        createdAt: '2023-02-10',
        domains: [],
        emailAccounts: []
      }
    ]
  },
  {
    id: '2',
    name: 'Резервный хостинг',
    provider: 'Reg.ru',
    plan: 'Профессиональный',
    status: 'active',
    ip: '192.168.2.100',
    loginUrl: 'https://reg.ru/hosting/login',
    username: 'user',
    password: 'securepass456',
    expiryDate: '2024-11-30',
    createdAt: '2023-03-01',
    servers: [
      {
        id: '2-1',
        name: 'Backup Server',
        ip: '192.168.2.101',
        status: 'online',
        cpu: '2 ядра',
        ram: '4GB',
        storage: '2TB HDD',
        os: 'Debian 11',
        createdAt: '2023-03-01',
        domains: [
          {
            id: 'd3',
            name: 'backup-site.com',
            status: 'active',
            expiryDate: '2024-11-30',
            createdAt: '2023-03-01'
          }
        ],
        emailAccounts: [
          {
            id: 'e3',
            email: 'info@backup-site.com',
            quota: '1GB',
            used: '0.2GB',
            status: 'active'
          }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Тестовый хостинг',
    provider: 'Beget',
    plan: 'Старт',
    status: 'suspended',
    ip: '192.168.3.100',
    loginUrl: 'https://beget.com/ru/login',
    username: 'testuser',
    password: 'testpass789',
    expiryDate: '2024-10-15',
    createdAt: '2023-04-20',
    servers: []
  }
];