import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { 
  ArrowLeft, 
  Server, 
  Globe, 
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Copy,
  Calendar,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHostings, Domain, Server as Serv } from '@/hooks/useHostings';

const ServerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchServer } = useHostings();
  
  const [server, setServer] = useState<Serv | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServerData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const serverData = await fetchServer(id);
        setServer(serverData);
      } catch (err) {
        setError('Ошибка загрузки данных сервера');
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить данные сервера",
        });
      } finally {
        setLoading(false);
      }
    };

    loadServerData();
  }, [id, fetchServer, toast]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: `${fieldName} скопирован в буфер обмена`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800 border-green-200";
      case "offline":
        return "bg-red-100 text-red-800 border-red-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Server className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Сервер не найден</h1>
          <p className="text-muted-foreground mb-4">
            {error || "Сервер с указанным ID не существует"}
          </p>
          <Button onClick={() => navigate('/hostings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к хостингам
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Хлебные крошки и заголовок */}
        <div className="mb-6">
          <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{server.name}</h1>
                  <Badge variant="outline" className={`${getStatusColor(server.status)} w-fit`}>
                    {getStatusText(server.status)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">IP: {server.ip}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/servers/edit/${server.id}`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  // Реализация удаления сервера
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Левая колонка - Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="overview">Обзор</TabsTrigger>
                <TabsTrigger value="domains">Домены</TabsTrigger>
              </TabsList>

              {/* Вкладка Обзор */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      Основная информация
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Название сервера</div>
                        <div className="text-foreground">{server.name}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">IP адрес</div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{server.ip}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(server.ip, 'IP адрес')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Статус</div>
                        <Badge variant="outline" className={getStatusColor(server.status)}>
                          {getStatusText(server.status)}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Операционная система</div>
                        <div className="text-foreground">{server.os || "Не указана"}</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Создан: {formatDate(server.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Технические характеристики */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="w-5 h-5" />
                      Технические характеристики
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">CPU</div>
                          <div className="text-sm text-muted-foreground">{server.cpu || "Не указано"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <MemoryStick className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">RAM</div>
                          <div className="text-sm text-muted-foreground">{server.ram || "Не указано"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <HardDrive className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Хранилище</div>
                          <div className="text-sm text-muted-foreground">{server.storage || "Не указано"}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Подключение к серверу */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="w-5 h-5" />
                      Подключение к серверу
                    </CardTitle>
                    <CardDescription>
                      Информация для подключения и управления сервером
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">SSH подключение</div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">ssh root@{server.ip}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(`ssh root@${server.ip}`, 'SSH команда')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Порт</div>
                        <div className="font-mono">22</div>
                      </div>
                    </div>
                    
                    {/* Дополнительные данные для подключения можно добавить здесь */}
                    <div className="text-sm text-muted-foreground">
                      Для подключения к серверу используйте SSH клиент с указанными выше данными.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Вкладка Домены */}
              <TabsContent value="domains" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Привязанные домены
                    </CardTitle>
                    <CardDescription>
                      {server.domains?.length || 0} доменов привязано к этому серверу
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {server.domains && server.domains.length > 0 ? (
                      <div className="space-y-4">
                        {server.domains.map((domain) => (
                          <Card key={domain.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Globe className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium">{domain.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Истекает: {formatDate(domain.expiry_date)}
                                    </div>
                                  </div>
                                </div>
                                <Badge variant="outline" className={
                                  domain.status === 'active' ? 'bg-green-100 text-green-800' :
                                  domain.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }>
                                  {domain.status === 'active' ? 'Активен' : 
                                   domain.status === 'pending' ? 'Ожидание' : 'Истек'}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Globe className="w-12 h-12 mx-auto mb-4" />
                        <p>К этому серверу не привязано ни одного домена</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Правая колонка - Дополнительная информация */}
          <div className="space-y-6">
            {/* Статистика */}
            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold">{server.domains?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Доменов</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {server.status === 'online' ? 'Online' : 'Offline'}
                    </div>
                    <div className="text-xs text-muted-foreground">Статус</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Быстрые действия */}
            <Card>
              <CardHeader>
                <CardTitle>Действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Server className="w-4 h-4 mr-2" />
                  Перезагрузить сервер
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Network className="w-4 h-4 mr-2" />
                  Проверить доступность
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Globe className="w-4 h-4 mr-2" />
                  Добавить домен
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerDetail;