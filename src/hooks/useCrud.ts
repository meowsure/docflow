import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/api";

export const useCrud = <T extends { id: string }>(endpoint: string) => {
  const [items, setItems] = useState<T[]>([]);
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

        const res = await api.get(`${endpoint}?page=${pageToLoad}`);
        const data: T[] = res.data.data || [];
        setItems((prev) => (append ? [...prev, ...data] : data));

        const meta = res.data.meta;
        setHasMore(meta && meta.current_page < meta.last_page);

        setPage(pageToLoad);
      } catch (err) {
        console.error(`Ошибка при загрузке ${endpoint}`, err);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: `Не удалось загрузить данные (${endpoint})`,
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [endpoint, toast]
  );

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchItems(page + 1, true);
    }
  };

  const createItem = async (data: Partial<T>): Promise<T | null> => {
    try {
      const res = await api.post(endpoint, data);
      const newItem = res.data;
      setItems((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      console.error(`Ошибка при создании (${endpoint})`, err);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: err.data || err || err.data.message,
      });
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<T>): Promise<T | null> => {
    try {
      const res = await api.put(`${endpoint}/${id}`, updates);
      const updated = res.data;
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      return updated;
    } catch (err) {
      console.error(`Ошибка при обновлении (${endpoint})`, err);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить запись",
      });
      return null;
    }
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`${endpoint}/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      return true;
    } catch (err) {
      console.error(`Ошибка при удалении (${endpoint})`, err);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить запись" + err.data.message || err.data,
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
    createItem,
    updateItem,
    deleteItem,
    refetch: () => fetchItems(1),
  };
};
