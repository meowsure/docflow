// hooks/useLogsPagination.ts
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/api";

interface Log {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  meta: Record<string, any>;
  ip: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    email?: string;
  };
}

interface LogsResponse {
  current_page: number;
  data: Log[];
  last_page: number;
  per_page: number;
  total: number;
}

export const useLogsPagination = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { toast } = useToast();

  const fetchLogs = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await api.get(`/logs?page=${page}`);
      const data: LogsResponse = response.data;

      setLogs(prev => append ? [...prev, ...data.data] : data.data);
      setCurrentPage(data.current_page);
      setTotalPages(data.last_page);
      setHasMore(data.current_page < data.last_page);

    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить логи",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toast]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      fetchLogs(currentPage + 1, true);
    }
  }, [hasMore, loadingMore, currentPage, fetchLogs]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  return {
    logs,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    currentPage,
    totalPages,
    refetch: () => fetchLogs(1),
  };
};