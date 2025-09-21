import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/api";

export interface Task {
  id: string;
  type: "send_docs" | "make_scan" | "shipment";
  description: string;
  status: "draft" | "submitted" | "completed";
  city?: string;
  created_at: string;
  updated_at: string;
  files?: TaskFile[];
}

export interface TaskFile {
  id: string;
  user_id: string;
  entity_type: string | null;
  entity_id: string | null;
  path: string;
  mime: string;
  size: number | null;
  created_at: string;
  updated_at: string;
  file_name?: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const { user, token } = useAuth();
  const { toast } = useToast();

  const fetchTasks = useCallback(
    async (pageToLoad: number = 1, append = false) => {
      if (!user || !token) return;

      try {
        if (pageToLoad === 1) setLoading(true);
        else setLoadingMore(true);

        const response = await api.get(`/tasks?page=${pageToLoad}`);
        const tasksData: Task[] = response.data.data || [];

        setTasks((prev) => (append ? [...prev, ...tasksData] : tasksData));

        // проверяем есть ли еще страницы
        const meta = response.data.meta;
        setHasMore(meta && meta.current_page < meta.last_page);

        setPage(pageToLoad);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить задачи",
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user, token, toast]
  );

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchTasks(page + 1, true);
    }
  };

  const createTask = async (taskData: Partial<Task>): Promise<Task | null> => {
    try {
      const response = await api.post("/tasks", taskData);
      const newTask = response.data;
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать задачу",
      });
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
    try {
      const response = await api.put(`/tasks/${taskId}`, updates);
      const updatedTask = response.data;

      setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)));
      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить задачу",
      });
      return null;
    }
  };

  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить задачу",
      });
      return false;
    }
  };

  // Автозагрузка первой страницы
  useEffect(() => {
    fetchTasks(1);
  }, [user, token, fetchTasks]);

  return {
    tasks,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    createTask,
    updateTask,
    deleteTask,
    refetch: () => fetchTasks(1),
  };
};
