import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  creator_id: string;
  assignee_id?: string;
  created_at: string;
  updated_at: string;
  // Relationships (if included in API response)
  creator?: User;
  assignee?: User;
}

export interface User {
  id: string;
  full_name: string;
  // Add other user fields as needed
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
  // Computed fields for convenience
  file_name?: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
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
      // Handle both paginated and non-paginated responses
      const tasksData = response.data.data || response.data;
      setTasks(Array.isArray(tasksData) ? tasksData : []);
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

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'creator_id'>): Promise<Task | null> => {
    if (!user || !token) return null;

    try {
      const response = await api.post('/tasks', taskData);
      const newTask = response.data;
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
      const updatedTask = response.data;
      
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
      // Get all files and filter by taskId on the client
      const response = await api.get('/files');
      const allFiles = response.data.data || response.data;
      
      // Filter files related to the current task
      const taskFiles = allFiles.filter((file: TaskFile) => 
        file.entity_type === 'task' && file.entity_id === taskId
      );
      
      // Enhance files with computed fields
      const enhancedFiles = taskFiles.map((file: TaskFile) => ({
        ...file,
        file_name: file.path.split('/').pop() || 'file',
        file_path: file.path,
        file_size: file.size,
        mime_type: file.mime,
      }));
      
      setFiles(enhancedFiles);
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

  const addFile = async (taskId: string, file: File): Promise<TaskFile | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entity_type', 'task');
      formData.append('entity_id', taskId);

      const response = await api.post('/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const newFile = response.data;
      
      // Add computed fields for compatibility
      const enhancedFile: TaskFile = {
        ...newFile,
        file_name: newFile.path.split('/').pop() || 'file',
        file_path: newFile.path,
        file_size: newFile.size,
        mime_type: newFile.mime,
      };
      
      setFiles(prev => [enhancedFile, ...prev]);
      return enhancedFile;
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

  const getFileUrl = (file: TaskFile): string => {
    return `/api/v1/files/${file.id}`;
  };

  const downloadFile = async (file: TaskFile): Promise<void> => {
    try {
      const response = await api.get(`/files/${file.id}`, {
        responseType: 'blob',
      });
      
      // Create download URL
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.file_name || 'file');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось скачать файл"
      });
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
    getFileUrl,
    downloadFile,
    refetch: fetchFiles
  };
};