// components/FileUploader.tsx
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, File, X, CheckCircle, AlertCircle, Loader } from "lucide-react";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'idle' | 'uploading' | 'completed' | 'error';
  serverId?: string; // ID файла на сервере после загрузки
  error?: string;
}

export interface FileUploaderProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  disabled?: boolean; // Для блокировки во время загрузки
}


const FileUploader = ({ onFilesChange, maxFiles = 10, disabled = false }: FileUploaderProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (disabled) return;

    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      status: 'idle' as const
    }));

    const updatedFiles = [...uploadedFiles, ...newFiles].slice(0, maxFiles);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [uploadedFiles, maxFiles, onFilesChange, disabled]);

  const removeFile = (id: string) => {
    if (disabled) return;
    
    const updatedFiles = uploadedFiles.filter(file => file.id !== id);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const clearAllFiles = () => {
    if (disabled) return;
    
    setUploadedFiles([]);
    onFilesChange([]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip'],
      'application/vnd.rar': ['.rar']
    },
    disabled,
    maxFiles
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (file: UploadedFile) => {
    const baseClass = "text-xs flex items-center";
    
    switch (file.status) {
      case 'uploading':
        return (
          <Badge variant="secondary" className={baseClass}>
            <Loader className="w-3 h-3 mr-1 animate-spin" />
            Загрузка...
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="success" className={baseClass}>
            <CheckCircle className="w-3 h-3 mr-1" />
            Загружено
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className={baseClass}>
            <AlertCircle className="w-3 h-3 mr-1" />
            Ошибка
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className={baseClass}>
            <File className="w-3 h-3 mr-1" />
            Готов к загрузке
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              disabled 
                ? 'border-muted-foreground/30 bg-muted/50 cursor-not-allowed' 
                : isDragActive 
                  ? 'border-primary bg-accent' 
                  : 'border-muted hover:border-muted-foreground/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className={`w-12 h-12 mx-auto mb-4 ${
              disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'
            }`} />
            <p className={`text-lg font-medium mb-2 ${
              disabled ? 'text-muted-foreground/50' : ''
            }`}>
              {disabled ? 'Загрузка файлов отключена' : 
               isDragActive ? 'Перетащите файлы сюда' : 'Загрузить файлы'}
            </p>
            <p className={`text-sm ${
              disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'
            }`}>
              Поддерживаются: PDF, DOC, DOCX, XLS, XLSX, изображения, архивы. Максимум {maxFiles} файлов.
            </p>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">
                Загруженные файлы ({uploadedFiles.length})
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFiles}
                disabled={disabled}
              >
                Очистить все
              </Button>
            </div>
            
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div 
                  key={file.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    file.status === 'error' 
                      ? 'border-destructive/20 bg-destructive/5' 
                      : 'bg-accent'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <File className={`w-4 h-4 ${
                      file.status === 'completed' ? 'text-success' : 
                      file.status === 'error' ? 'text-destructive' : 'text-primary'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                        {file.error && ` • ${file.error}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    {getStatusBadge(file)}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={disabled || file.status === 'uploading'}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploader;