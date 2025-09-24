import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/api";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "draft" | "submitted" | "completed" | "in_progress" | "created";
  city?: string;
  task_type?: string;
  creator_id: string;
  assignee_id: string;
  created_at: string;
  updated_at: string;
  meta: string;
  // Relationships
  creator?: User;
  assignee?: User;
  files?: TaskFile[];
}

export interface User {
  id: string;
  full_name: string;
  photo_url: string;
  username: string;
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

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  // Add other pagination fields as needed
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTasks = useCallback(
    async (pageToLoad: number = 1, append = false) => {
      if (!user) return;

      try {
        if (pageToLoad === 1) setLoading(true);
        else setLoadingMore(true);

        const response = await api.get(`/tasks?page=${pageToLoad}`);
        const tasksData: Task[] = response.data.data || [];
        const paginationMeta: PaginationMeta = response.data.meta;

        setTasks((prev) => (append ? [...prev, ...tasksData] : tasksData));
        setMeta(paginationMeta);

        // Check if there are more pages
        setHasMore(paginationMeta && paginationMeta.current_page < paginationMeta.last_page);
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
    [user, toast]
  );

  const loadMore = () => {
    if (hasMore && !loadingMore && meta) {
      fetchTasks(meta.current_page + 1, true);
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
        description: "Не удалось создать задачу: " + error,
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

  // Auto-load first page
  useEffect(() => {
    fetchTasks(1);
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    loadingMore,
    hasMore,
    meta,
    loadMore,
    createTask,
    updateTask,
    deleteTask,
    refetch: () => fetchTasks(1),
  };
};