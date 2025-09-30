import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

export interface Server {
  id?: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'maintenance';
  cpu: string;
  ram: string;
  storage: string;
  os: string;
  login?: string;
  password?: string;
  hosting_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Hosting {
  id?: string;
  name: string;
  provider: string;
  plan: string;
  status: 'active' | 'suspended' | 'pending';
  ip: string;
  login_url: string;
  username: string;
  password: string;
  expiry_date: string;
  servers?: Server[];
  created_at?: string;
  updated_at?: string;
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
  const createHosting = useCallback(async (hostingData: Omit<Hosting, 'id'>): Promise<Hosting> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Отправка данных хостинга:', hostingData);
      
      const response = await api.post('/hostings', hostingData);
      const result = response.data.data || response.data;
      
      toast({
        title: "Хостинг создан",
        description: "Хостинг успешно добавлен в систему",
      });
      
      return result;
    } catch (err: any) {
      console.error('Ошибка создания хостинга:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при создании хостинга';
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