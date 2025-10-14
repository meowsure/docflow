// hooks/useFiles.ts
import { useState } from "react";
import api from "@/api";

export interface TaskFile {
  id: string;
  user_id: string;
  entity_type: string | null;
  entity_id: string | null;
  path: string;
  mime: string;
  name: string;
  size: number | null;
  created_at: string;
  updated_at: string;
  file_name?: string;
  file_path?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'idle' | 'uploading' | 'completed' | 'error';
  serverId?: string;
  error?: string;
}

export const useFiles = () => {
  const [uploading, setUploading] = useState(false);

  // Базовая функция загрузки одного файла
  const uploadFile = async (
    file: File, 
    entityType?: string, 
    entityId?: string
  ): Promise<TaskFile> => {
    const formData = new FormData();
    formData.append("file", file);
    
    if (entityType) {
      formData.append("entity_type", entityType);
    }
    if (entityId) {
      formData.append("entity_id", entityId);
    }

    const response = await api.post("/files", formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  };

  // Функция для загрузки нескольких файлов с отслеживанием прогресса
  const uploadFilesWithProgress = async (
    files: UploadedFile[],
    entityType: string,
    entityId: string,
    onProgress?: (fileId: string, status: UploadedFile['status'], serverId?: string, error?: string) => void
  ): Promise<{ 
    successes: TaskFile[]; 
    errors: Array<{ file: UploadedFile; error: string }> 
  }> => {
    if (files.length === 0) {
      return { successes: [], errors: [] };
    }

    setUploading(true);
    
    const successes: TaskFile[] = [];
    const errors: Array<{ file: UploadedFile; error: string }> = [];

    // Загружаем файлы последовательно для избежания проблем с сервером
    for (const file of files) {
      try {
        // Пропускаем файлы, которые уже загружены или в процессе
        if (file.status === 'completed' || file.status === 'uploading') {
          continue;
        }

        onProgress?.(file.id, 'uploading');
        
        const uploadedFile = await uploadFile(file.file, entityType, entityId);
        
        onProgress?.(file.id, 'completed', uploadedFile.id);
        successes.push(uploadedFile);
        
        // Небольшая задержка между загрузками для снижения нагрузки
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: any) {
        console.error('Error uploading file:', error);
        
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error 
          || error.message 
          || 'Неизвестная ошибка загрузки';
        
        onProgress?.(file.id, 'error', undefined, errorMessage);
        errors.push({ file, error: errorMessage });
      }
    }

    setUploading(false);
    return { successes, errors };
  };

  // Функция для прикрепления уже загруженных файлов к задаче
  const attachFilesToTask = async (taskId: string, fileIds: string[]): Promise<void> => {
    if (fileIds.length === 0) return;

    try {
      await api.patch(`/tasks/${taskId}/attach-files`, {
        file_ids: fileIds
      });
    } catch (error: any) {
      console.error('Error attaching files to task:', error);
      throw new Error(
        error.response?.data?.message 
        || error.response?.data?.error 
        || 'Ошибка прикрепления файлов к задаче'
      );
    }
  };

  // Функция для получения файлов задачи
  const getTaskFiles = async (taskId: string): Promise<TaskFile[]> => {
    try {
      const response = await api.get(`/tasks/${taskId}/files`);
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('Error fetching task files:', error);
      throw new Error(
        error.response?.data?.message 
        || error.response?.data?.error 
        || 'Ошибка загрузки файлов задачи'
      );
    }
  };

  // Функция для удаления файла
  const deleteFile = async (fileId: string): Promise<void> => {
    try {
      await api.delete(`/files/${fileId}`);
    } catch (error: any) {
      console.error('Error deleting file:', error);
      throw new Error(
        error.response?.data?.message 
        || error.response?.data?.error 
        || 'Ошибка удаления файла'
      );
    }
  };

  // Функция для скачивания файла
  const downloadFile = async (fileId: string, fileName: string): Promise<void> => {
    try {
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob'
      });

      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Очистка
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading file:', error);
      throw new Error(
        error.response?.data?.message 
        || error.response?.data?.error 
        || 'Ошибка скачивания файла'
      );
    }
  };

  return { 
    uploadFile, 
    uploadFilesWithProgress,
    attachFilesToTask,
    getTaskFiles,
    deleteFile,
    downloadFile,
    uploading 
  };
};