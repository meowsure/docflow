import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type TaskRow = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export interface Task extends TaskRow {}

export interface TaskFile {
  id: string;
  task_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить задачи"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: TaskInsert): Promise<Task | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать задачу"
      });
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: TaskUpdate): Promise<Task | null> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? data : task
      ));
      
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить задачу"
      });
      return null;
    }
  };

  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить задачу"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks
  };
};

export const useTaskFiles = (taskId?: string) => {
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFiles = async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('task_files')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить файлы"
      });
    } finally {
      setLoading(false);
    }
  };

  const addFile = async (fileData: Omit<TaskFile, 'id' | 'created_at'>): Promise<TaskFile | null> => {
    try {
      const { data, error } = await supabase
        .from('task_files')
        .insert(fileData)
        .select()
        .single();

      if (error) throw error;
      
      setFiles(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding file:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось добавить файл"
      });
      return null;
    }
  };

  const removeFile = async (fileId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('task_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
      
      setFiles(prev => prev.filter(file => file.id !== fileId));
      return true;
    } catch (error) {
      console.error('Error removing file:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить файл"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [taskId]);

  return {
    files,
    loading,
    addFile,
    removeFile,
    refetch: fetchFiles
  };
};