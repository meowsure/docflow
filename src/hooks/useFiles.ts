// hooks/useFiles.ts
import { useState } from "react";
import api from "@/api";

export interface TaskFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File; // Сам файл для загрузки
  status?: 'uploading' | 'completed' | 'error'; // Статус загрузки
}



export const useFiles = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, entityType?: string, entityId?: string): Promise<TaskFile | null> => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      // Добавляем параметры привязки к сущности, если переданы
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
    } catch (error) {
      console.error("Ошибка загрузки файла:", error);
      throw error; // Пробрасываем ошибку для обработки в компоненте
    } finally {
      setUploading(false);
    }
  };

  const attachFilesToTask = async (taskId: string, fileIds: string[]): Promise<boolean> => {
    try {
      await api.patch(`/tasks/${taskId}/attach-files`, {
        file_ids: fileIds
      });
      return true;
    } catch (error) {
      console.error("Ошибка прикрепления файлов к задаче:", error);
      throw error;
    }
  };

  const deleteFile = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/files/${id}`);
      return true;
    } catch (error) {
      console.error("Ошибка удаления файла:", error);
      throw error;
    }
  };

  return {
    uploadFile,
    deleteFile,
    attachFilesToTask,
    uploading
  };
};