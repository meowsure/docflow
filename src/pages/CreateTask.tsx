import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileUploader from "@/components/FileUploader";
import Header from "@/components/Header";
import { ArrowLeft, Send, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '@/hooks/useUsers';
import { useFiles } from '@/hooks/useFiles';
import { UploadedFile } from '@/components/FileUploader';

const CreateTask = () => {
  const { toast } = useToast();
  const { createTask } = useTasks();
  const { user: currentUser } = useAuth();
  const { items: users } = useUsers();
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { uploadFilesWithProgress, uploading: filesUploading } = useFiles();
  const [taskType, setTaskType] = useState<'send_docs' | 'make_scan'>('send_docs');
  const [city, setCity] = useState<'Москву' | 'Другой город'>('Москву');
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Необходимо загрузить хотя бы один файл"
      });
      return;
    }

    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Укажите заголовок задачи"
      });
      return;
    }

    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Укажите описание задачи"
      });
      return;
    }

    try {
      setLoading(true);

      const meta = [];
      meta.push({ description: description.trim() })

      // Создаем задачу
      const task = await createTask({
        title: title.trim(),
        task_type: taskType,
        city,
        meta: meta,
        assignee_id: assignee,
      });

      if (task && task.id) {
        // Если есть файлы, загружаем их с прогрессом
        if (files.length > 0) {
          const { successes, errors } = await uploadFilesWithProgress(
            files,
            'App\\Models\\Task', // entity_type для Laravel
            task.id, // entity_id - ID созданной задачи
            // Колбэк для обновления статуса каждого файла
            (fileId, status, serverId) => {
              setFiles(prevFiles =>
                prevFiles.map(file =>
                  file.id === fileId
                    ? { ...file, status, ...(serverId && { serverId }) }
                    : file
                )
              );
            }
          );

          if (errors.length > 0) {
            toast({
              variant: "destructive",
              title: "Частичная ошибка",
              description: `Задача создана, но ${errors.length} из ${files.length} файлов не загружены`
            });
          } else {
            toast({
              title: "Успех!",
              description: `Задача и ${successes.length} файлов успешно созданы`
            });
          }
        } else {
          toast({
            title: "Задача создана",
            description: "Задача успешно создана"
          });
        }

        navigate('/tasks');
      }
    } catch (error) {
      console.error('Create task error:', error);

      // Улучшенная обработка ошибок
      let errorMessage = "Не удалось создать задачу";
      if (error.response?.data?.errors) {
        // Обработка ошибок валидации Laravel
        const validationErrors = Object.values(error.response.data.errors).flat();
        errorMessage = validationErrors.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (


      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" className="mb-4" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Создать отправку</h1>
              <p className="text-muted-foreground">Отправка документов или сканирование</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Документы</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Загрузите файлы для отправки или сканирования
                </p>
                <FileUploader onFilesChange={setFiles} maxFiles={20} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Детали задачи</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Заголовок задачи *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Краткое описание задачи"
                  />
                </div>

                <div>
                  <Label htmlFor="taskType">Тип задачи *</Label>
                  <Select value={taskType} onValueChange={(value: 'send_docs' | 'make_scan') => setTaskType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send_docs">📤 Отправить документы</SelectItem>
                      <SelectItem value="make_scan">🖨 Сделать скан</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assignee">Исполнитель *</Label>
                  <Select value={assignee} onValueChange={(value) => setAssignee(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        user.id === currentUser.id ? null : (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name}
                          </SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>

                </div>

                {taskType === 'send_docs' && (
                  <div>
                    <Label htmlFor="city">Город назначения *</Label>
                    <Select value={city} onValueChange={(value: 'Москву' | 'Другой город') => setCity(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Москву">🏙 В Москву</SelectItem>
                        <SelectItem value="Другой город">🚚 В другой город</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Описание задачи *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Подробное описание задачи: что важно учитывать? Адресаты, сроки и т.п."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Сводка</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Заголовок:</span>
                    <span className="font-medium">
                      {title.trim() ? title : 'Не заполнено'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Тип задачи:</span>
                    <span className="font-medium">
                      {taskType === 'send_docs' ? 'Отправка документов' : 'Сканирование'}
                    </span>
                  </div>
                  {taskType === 'send_docs' && (
                    <div className="flex justify-between text-sm">
                      <span>Город:</span>
                      <span className="font-medium">{city}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Файлов загружено:</span>
                    <span className="font-medium">{files.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Описание:</span>
                    <span className="font-medium">
                      {description.trim() ? 'Заполнено' : 'Не заполнено'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  size="lg"
                  disabled={loading || !title.trim() || !description.trim()}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                      Создание...
                    </>
                  ) : taskType === 'send_docs' ? (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Создать отправку
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Создать задачу на скан
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default CreateTask;