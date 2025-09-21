// useFiles.ts
import { useCrud } from "./useCrud";

export interface File {
  id: string;
  path: string;
  mime: string;
  size: number;
  created_at: string;
}

export const useFiles = () => {
  return useCrud<File>("/files");
};
