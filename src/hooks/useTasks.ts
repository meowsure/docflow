import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/api'; // Импортируем настроенный экземпляр axios

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Добавьте другие поля, которые есть в вашей модели Task на сервере
}

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
  const { user, token } = useAuth();
  const { toast } = useToast();

  const fetchTasks = async () => {
    if (!user || !token) return;
    
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.data || response.data);
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

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Task | null> => {
    if (!user || !token) return null;

    try {
      const response = await api.post('/tasks', {
        ...taskData,
        status: 'draft'
      });
      
      const newTask = response.data.data || response.data;
      setTasks(prev => [newTask, ...prev]);
      
      return newTask;
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

  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
    try {
      const response = await api.put(`/tasks/${taskId}`, updates);
      const updatedTask = response.data.data || response.data;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      return updatedTask;
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
      await api.delete(`/tasks/${taskId}`);
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
  }, [user, token]);

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
      // Предполагаем, что у вас есть эндпоинт для получения файлов задачи
      const response = await api.get(`/tasks/${taskId}/files`);
      setFiles(response.data.data || response.data);
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

  const addFile = async (fileData: FormData): Promise<TaskFile | null> => {
    try {
      // Предполагаем, что у вас есть эндпоинт для загрузки файлов
      const response = await api.post('/files', fileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const newFile = response.data.data || response.data;
      setFiles(prev => [newFile, ...prev]);
      return newFile;
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
      await api.delete(`/files/${fileId}`);
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