// useNotifications.ts
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/api";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
  };
}

export const useNotifications = () => {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const { toast } = useToast();

  const fetchItems = useCallback(
    async (pageToLoad: number = 1, append = false) => {
      try {
        if (pageToLoad === 1) setLoading(true);
        else setLoadingMore(true);

        const res = await api.get(`/notifications?page=${pageToLoad}`);
        const data: Notification[] = res.data.data || [];
        setItems((prev) => (append ? [...prev, ...data] : data));

        const meta = res.data.meta;
        setHasMore(meta && meta.current_page < meta.last_page);

        setPage(pageToLoad);
      } catch (err) {
        console.error("Ошибка при загрузке уведомлений", err);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить уведомления",
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [toast]
  );

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchItems(page + 1, true);
    }
  };

  const markAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      
      // Обновляем локальное состояние
      setItems(prev => prev.map(item => 
        item.id === notificationId ? { ...item, is_read: true } : item
      ));
      
      return true;
    } catch (err) {
      console.error("Ошибка при отметке уведомления как прочитанного", err);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отметить уведомление как прочитанное",
      });
      return false;
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    try {
      // Отмечаем все непрочитанные уведомления как прочитанные
      const unreadNotifications = items.filter(item => !item.is_read);
      
      for (const notification of unreadNotifications) {
        await api.post(`/notifications/${notification.id}/read`);
      }
      
      // Обновляем локальное состояние
      setItems(prev => prev.map(item => ({ ...item, is_read: true })));
      
      toast({
        title: "Успех",
        description: "Все уведомления отмечены как прочитанные",
      });
      
      return true;
    } catch (err) {
      console.error("Ошибка при отметке всех уведомлений как прочитанных", err);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отметить все уведомления как прочитанные",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchItems(1);
  }, [fetchItems]);

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    refetch: () => fetchItems(1),
  };
};