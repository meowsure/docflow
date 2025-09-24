import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/Header";
import { ArrowLeft, FileText, Package, Send, Calendar, MapPin, User, Edit, Trash2, Image, Archive, ArrowRight, CheckCircle, X, Folder, File, Search, Upload, Download, Eye } from "lucide-react";
import { useTasks } from '@/hooks/useTasks';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, loading, refetch, deleteTask, updateTask } = useTasks();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const { user: currentUser } = useAuth();

  // Найти задачу по ID
  const task = tasks.find(t => t.id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;

    try {
      await updateTask(task.id, { status: newStatus });
      toast({
        title: "Статус обновлен",
        description: `Статус задачи обновлен на "${newStatus}"`,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || "Не удалось обновить статус задачи",
        variant: "destructive",
      });
    }
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Задача не найдена</h1>
          <p className="text-muted-foreground mb-4">Задача с ID {id} не существует</p>
          <Button onClick={() => navigate('/tasks')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к задачам
          </Button>
        </div>
      </div>
    );
  }

  const getTaskIcon = () => {
    switch (task.task_type) {
      case 'send_docs':
        return <Send className="w-6 h-6" />;
      case 'make_scan':
        return <FileText className="w-6 h-6" />;
      case 'shipment':
        return <Package className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getTaskTitle = () => {
    switch (task.task_type) {
      case 'send_docs':
        return 'Отправка документов';
      case 'make_scan':
        return 'Сканирование документов';
      case 'shipment':
        return 'Отгрузка товаров';
      default:
        return 'Задача';
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'draft':
        return 'secondary';
      case 'submitted':
        return 'default';
      case 'created':
        return 'default';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case 'draft':
        return 'Черновик';
      case 'created':
        return 'Создано';
      case 'submitted':
        return 'Отправлено';
      case 'in_progress':
        return 'В работе';
      case 'completed':
        return 'Выполнено';
      default:
        return task.status;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <File className="h-5 w-5 text-red-500" />;
      case "xlsx":
        return <File className="h-5 w-5 text-green-500" />;
      case "jpg":
        return <File className="h-5 w-5 text-blue-500" />;
      case "docx":
        return <File className="h-5 w-5 text-blue-600" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" className="mb-4" onClick={() => navigate('/tasks')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к задачам
          </Button>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                {getTaskIcon()}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-2xl font-bold">{getTaskTitle()}</h1>
                  <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
                </div>
                <p className="text-muted-foreground">ID: {task.id}</p>
              </div>
            </div>

            {task.creator_id == currentUser.id && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/tasks/edit/${task.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
                {currentUser.id === task.creator.id && (currentUser.role.name == "Администратор" || currentUser.role.permissions_codes.includes('delete_tasks')) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const success = await deleteTask(task.id);
                      if (success) {
                        toast({
                          title: "Задача удалена",
                          description: "Задача успешно удалена",
                        });
                        navigate("/tasks");
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Удалить
                  </Button>
                )}

              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle>Описание задачи</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {task.title || 'Заголовок отсутствует'}
                </p>
                <p className="text-foreground leading-relaxed">
                  {task.description || 'Описание отсутствует'}
                </p>
              </CardContent>
            </Card>

          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {task.assignee_id == currentUser.id && (task.status === 'draft' || task.status === 'new') && (
              <Button
                variant="outline"
                className="w-full mb-2"
                onClick={() => handleStatusChange('in_progress')}
              >
                <User className="w-4 h-4 mr-2" />
                Приступить к выполнению задачи
              </Button>
            )}

            {task.assignee_id == currentUser.id && task.status === 'in_progress' && (
              <Button
                variant="outline"
                className="w-full mb-2"
                onClick={() => handleStatusChange('submitted')}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Сдать задачу
              </Button>
            )}

            {task.creator_id == currentUser.id && task.status === 'submitted' && (
              <div>
                <Button
                  variant="outline"
                  className="w-full mb-2"
                  onClick={() => handleStatusChange('completed')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Подтвердить выполнение задачи
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange('draft')}
                >
                  <X className="w-4 h-4 mr-2" />
                  Вернуть задачу в работу
                </Button>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Информация о задаче</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Создано</p>
                    <p className="text-muted-foreground">
                      {new Date(task.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="text-sm">
                  <p className="font-medium mb-1">Статус</p>
                  <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Создатель задачи</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 text-sm">
                  {task.creator.photo_url && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={task.creator.photo_url} alt={task.creator.full_name} />
                      <AvatarFallback>{task.creator.username}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <p className="font-medium">{task.creator.full_name}</p>
                    <p className="text-muted-foreground">
                      {task.creator.username}
                    </p>
                  </div>
                </div>
                {task.assignee && (
                  <div>
                    <CardTitle className='my-3'>Исполнитель</CardTitle>
                    <div className="flex items-center space-x-3 text-sm">
                      {task.assignee.photo_url && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={task.assignee.photo_url} alt={task.assignee.full_name} />
                          <AvatarFallback>{task.assignee.username}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <p className="font-medium">{task.assignee && currentUser.id === task.assignee.id ? 'Вы' : (task.assignee?.full_name || 'Не назначен')}</p>
                        <p className="text-muted-foreground">
                          {task.assignee.username}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Файлы */}
            <Card>
              <CardHeader>
                <CardTitle>Прикрепленные файлы</CardTitle>
              </CardHeader>
              <CardContent>
                {!task.files || task.files.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Файлы пока не загружены</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {task.files.map((file) => {
                      // Функция для получения иконки файла
                      const getFileIcon = (fileType: string) => {
                        const iconClass = "h-8 w-8 text-muted-foreground";

                        switch (fileType.toLowerCase()) {
                          case 'pdf':
                            return <FileText className={iconClass} />;
                          case 'doc':
                          case 'docx':
                            return <FileText className={iconClass} />;
                          case 'xls':
                          case 'xlsx':
                            return <FileText className={iconClass} />;
                          case 'jpg':
                          case 'jpeg':
                          case 'png':
                          case 'gif':
                          case 'webp':
                            return <Image className={iconClass} />;
                          case 'zip':
                          case 'rar':
                            return <Archive className={iconClass} />;
                          default:
                            return <File className={iconClass} />;
                        }
                      };

                      // Функция для форматирования размера файла
                      const formatFileSize = (bytes: number | null) => {
                        if (!bytes) return '0 Б';
                        const units = ['Б', 'КБ', 'МБ', 'ГБ'];
                        let size = bytes;
                        let unitIndex = 0;
                        while (size >= 1024 && unitIndex < units.length - 1) {
                          size /= 1024;
                          unitIndex++;
                        }
                        return `${size.toFixed(1)} ${units[unitIndex]}`;
                      };

                      // Функция для форматирования даты
                      const formatDate = (dateString: string) => {
                        return new Date(dateString).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      };

                      // Извлекаем имя файла из path
                      const getFileName = (path: string) => {
                        return path.split('/').pop() || 'Файл';
                      };

                      // Получаем расширение файла из mime type или path
                      const getFileExtension = () => {
                        if (file.mime) {
                          return file.mime.split('/')[1]?.toUpperCase() || 'FILE';
                        }
                        return getFileName(file.path).split('.').pop()?.toUpperCase() || 'FILE';
                      };

                      return (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {getFileIcon(getFileExtension().toLowerCase())}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium truncate">{getFileName(file.path)}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                <span>{formatFileSize(file.size)}</span>
                                <span>•</span>
                                <span>{formatDate(file.created_at)}</span>
                                <span>•</span>
                                <span>{getFileExtension()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Открываем файл в новом окне
                                // Нужно создать полный URL к файлу
                                const fileUrl = `${window.location.origin}/storage/${file.path}`;
                                window.open(fileUrl, '_blank');
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Создаем временную ссылку для скачивания
                                const fileUrl = `${window.location.origin}/storage/${file.path}`;
                                const link = document.createElement('a');
                                link.href = fileUrl;
                                link.download = getFileName(file.path);
                                link.click();
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;