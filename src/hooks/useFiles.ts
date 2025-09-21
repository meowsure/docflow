import api from "@/api";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export const useFiles = () => {
  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (err) {
      console.error("Ошибка загрузки файла", err);
      return null;
    }
  };

  const deleteFile = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/files/${id}`);
      return true;
    } catch (err) {
      console.error("Ошибка удаления файла", err);
      return false;
    }
  };

  return { uploadFile, deleteFile };
};