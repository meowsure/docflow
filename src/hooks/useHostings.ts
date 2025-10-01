// hooks/useHostings.ts
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

export interface DomainFormData {
  server_id: string;
  name: string;
  status?: 'active' | 'pending' | 'expired';
  expiry_date: string;
}

export interface EmailAccountFormData {
  server_id: string;
  email: string;
  quota: string;
  used?: string;
  password?: string;
  status?: 'active' | 'suspended';
  last_login?: string;
}

export interface ServerFormData {
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'maintenance';
  cpu?: string;
  ram?: string;
  storage?: string;
  os?: string;
}

export interface HostingFormData {
  name: string;
  provider: string;
  plan: string;
  status: 'active' | 'suspended' | 'pending';
  ip?: string;
  login_url?: string;
  username?: string;
  password?: string;
  expiry_date: string;
  servers?: ServerFormData[];
}

export interface Hosting extends HostingFormData {
  id: string; // Изменено на string для UUID
  created_by: string;
  created_at: string;
  updated_at: string;
  servers?: Server[];
}

export interface Server {
  id: string;
  hosting_id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'maintenance';
  cpu?: string;
  ram?: string;
  storage?: string;
  os?: string;
  created_at: string;
  updated_at: string;
  domains?: Domain[]; // Опционально, если загружаются с сервером
  email_accounts?: EmailAccount[]; // Опционально, если загружаются с сервером
}

export interface HostingStats {
  total: number;
  active: number;
  suspended: number;
  pending: number;
  expiring_soon: number;
}

export interface Domain {
  id: string;
  server_id: string;
  name: string;
  status: 'active' | 'pending' | 'expired';
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

export interface EmailAccount {
  id: string;
  server_id: string;
  email: string;
  quota: string; // например: '5GB'
  used: string; // например: '1.2GB'
  password?: string; // nullable в миграции
  status: 'active' | 'suspended';
  last_login?: string; // nullable в миграции
  created_at: string;
  updated_at: string;
}

export const useHostings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Получить все хостинги
  const fetchHostings = useCallback(async (): Promise<Hosting[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/hostings');
      return response.data.data || response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при загрузке хостингов';
      setError(errorMessage);
      toast({
        title: "Ошибка загрузки",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Получить статистику хостингов
  const fetchStats = useCallback(async (): Promise<HostingStats> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/hostings/stats');
      return response.data.data || response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при загрузке статистики';
      setError(errorMessage);
      toast({
        title: "Ошибка загрузки статистики",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Создать хостинг
  const createHosting = useCallback(async (hostingData: HostingFormData): Promise<Hosting> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Отправка данных хостинга:', hostingData);

      // Фильтруем серверы - отправляем только те, у которых заполнены обязательные поля
      const dataToSend = {
        ...hostingData,
        servers: hostingData.servers?.filter(server => server.name && server.ip) || []
      };

      const response = await api.post('/hostings', dataToSend);
      const result = response.data.data || response.data;

      toast({
        title: "Хостинг создан",
        description: "Хостинг успешно добавлен в систему",
      });

      return result;
    } catch (err: any) {
      console.error('Ошибка создания хостинга:', err);

      const errorMessage = err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        err.message ||
        'Ошибка при создании хостинга';
      setError(errorMessage);

      toast({
        title: "Хостинг не удалось создать",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Обновить хостинг
  const updateHosting = useCallback(async (id: string, hostingData: Partial<Hosting>): Promise<Hosting> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/hostings/${id}`, hostingData);
      const result = response.data.data || response.data;

      toast({
        title: "Хостинг обновлен",
        description: "Данные хостинга успешно обновлены",
      });

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при обновлении хостинга';
      setError(errorMessage);

      toast({
        title: "Ошибка обновления",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Удалить хостинг
  const deleteHosting = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/hostings/${id}`);

      toast({
        title: "Хостинг удален",
        description: "Хостинг успешно удален из системы",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при удалении хостинга';
      setError(errorMessage);

      toast({
        title: "Ошибка удаления",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Получить серверы хостинга
  const fetchServers = useCallback(async (hostingId: string): Promise<Server[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/hostings/${hostingId}/servers`);
      return response.data.data || response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при загрузке серверов';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Добавить сервер к хостингу
  const addServer = useCallback(async (hostingId: string, serverData: Omit<Server, 'id' | 'hosting_id'>): Promise<Server> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/hostings/${hostingId}/servers`, serverData);
      const result = response.data.data || response.data;

      toast({
        title: "Сервер добавлен",
        description: "Сервер успешно добавлен к хостингу",
      });

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при добавлении сервера';
      setError(errorMessage);

      toast({
        title: "Ошибка добавления сервера",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Обновить сервер
  const updateServer = useCallback(async (serverId: string, serverData: Partial<Server>): Promise<Server> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/servers/${serverId}`, serverData);
      const result = response.data.data || response.data;

      toast({
        title: "Сервер обновлен",
        description: "Данные сервера успешно обновлены",
      });

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при обновлении сервера';
      setError(errorMessage);

      toast({
        title: "Ошибка обновления сервера",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Удалить сервер
  const deleteServer = useCallback(async (serverId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/servers/${serverId}`);

      toast({
        title: "Сервер удален",
        description: "Сервер успешно удален",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при удалении сервера';
      setError(errorMessage);

      toast({
        title: "Ошибка удаления сервера",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchDomains = useCallback(async (serverId: string): Promise<Domain[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/servers/${serverId}/domains`);
      return response.data.data || response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при загрузке доменов';
      setError(errorMessage);
      toast({
        title: "Ошибка загрузки доменов",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createDomain = useCallback(async (domainData: DomainFormData): Promise<Domain> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/servers/${domainData.server_id}/domains`, domainData);
      const result = response.data.data || response.data;

      toast({
        title: "Домен создан",
        description: "Доменное имя успешно добавлено",
      });

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при создании домена';
      setError(errorMessage);

      toast({
        title: "Ошибка создания домена",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateDomain = useCallback(async (domainId: string, domainData: Partial<Domain>): Promise<Domain> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/domains/${domainId}`, domainData);
      const result = response.data.data || response.data;

      toast({
        title: "Домен обновлен",
        description: "Данные домена успешно обновлены",
      });

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при обновлении домена';
      setError(errorMessage);

      toast({
        title: "Ошибка обновления домена",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteDomain = useCallback(async (domainId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/domains/${domainId}`);

      toast({
        title: "Домен удален",
        description: "Доменное имя успешно удалено",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при удалении домена';
      setError(errorMessage);

      toast({
        title: "Ошибка удаления домена",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Почтовые ящики
  const fetchEmailAccounts = useCallback(async (serverId: string): Promise<EmailAccount[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/servers/${serverId}/email-accounts`);
      return response.data.data || response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при загрузке почтовых ящиков';
      setError(errorMessage);
      toast({
        title: "Ошибка загрузки почтовых ящиков",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createEmailAccount = useCallback(async (emailData: EmailAccountFormData): Promise<EmailAccount> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/servers/${emailData.server_id}/email-accounts`, emailData);
      const result = response.data.data || response.data;

      toast({
        title: "Почтовый ящик создан",
        description: "Почтовый ящик успешно добавлен",
      });

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при создании почтового ящика';
      setError(errorMessage);

      toast({
        title: "Ошибка создания почтового ящика",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateEmailAccount = useCallback(async (emailId: string, emailData: Partial<EmailAccount>): Promise<EmailAccount> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/email-accounts/${emailId}`, emailData);
      const result = response.data.data || response.data;

      toast({
        title: "Почтовый ящик обновлен",
        description: "Данные почтового ящика успешно обновлены",
      });

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при обновлении почтового ящика';
      setError(errorMessage);

      toast({
        title: "Ошибка обновления почтового ящика",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteEmailAccount = useCallback(async (emailId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/email-accounts/${emailId}`);

      toast({
        title: "Почтовый ящик удален",
        description: "Почтовый ящик успешно удален",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при удалении почтового ящика';
      setError(errorMessage);

      toast({
        title: "Ошибка удаления почтового ящика",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    // Состояние
    loading,
    error,

    // Хостинги
    fetchHostings,
    fetchStats,
    createHosting,
    updateHosting,
    deleteHosting,

    // Серверы
    fetchServers,
    addServer,
    updateServer,
    deleteServer,

    // Совместимость со старым кодом
    createItem: createHosting,
    updateItem: updateHosting,
    deleteItem: deleteHosting,
  };
};