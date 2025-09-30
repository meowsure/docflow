// pages/HostingDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Server,
  Globe,
  Mail,
  Calendar,
  Edit,
  Trash2,
  Cpu,
  MemoryStick,
  HardDrive,
  Copy,
  ExternalLink,
  Shield,
  Network,
  Loader2
} from "lucide-react";
import { useHostings, Hosting, Domain, EmailAccount, Server as ServerType  } from '@/hooks/useHostings';
import { useToast } from "@/hooks/use-toast";
import api from '@/api';

const HostingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [hosting, setHosting] = useState<Hosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    deleteItem
  } = useHostings();

  useEffect(() => {
    const fetchHosting = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/hostings/${id}`);

        if (!response.data) {
          throw new Error('Hosting not found');
        }

        const result = response.data;
        setHosting(result);
      } catch (error) {
        console.error('Error fetching hosting:', error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить данные хостинга",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHosting();
    }
  }, [id, toast]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "Скопировано",
      description: `${field} скопирован в буфер обмена`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот хостинг?')) {
      const success = deleteItem(hosting!.id);
      if (success) {
        toast({
          title: "Хостинг удален",
          description: "Хостинг успешно удален",
        });
        navigate("/hostings");
      }
    }
  };

  if (loading) {
    return (

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }


  if (!hosting) {
    return (

      <div className="container mx-auto px-4 py-8 text-center">
        <Server className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Хостинг не найден</h1>
        <p className="text-muted-foreground mb-4">Хостинг с ID {id} не существует</p>
        <Button onClick={() => navigate('/hostings')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Вернуться к хостингам
        </Button>
      </div>

    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'suspended': return 'Приостановлен';
      case 'pending': return 'Ожидание';
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const InfoRow = ({ icon: Icon, label, value, copyable = false, className = "" }) => (
    <div className={`flex items-center justify-between py-2 ${className}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="text-foreground truncate" title={value}>{value || "Не указано"}</div>
        </div>
      </div>
      {copyable && value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(value, label)}
          className="flex-shrink-0 ml-2"
        >
          <Copy className={`w-4 h-4 ${copiedField === label ? 'text-green-500' : 'text-muted-foreground'}`} />
        </Button>
      )}
    </div>
  );

  const DomainCard = ({ domain }: { domain: Domain }) => (
    <Card key={domain.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{domain.name}</span>
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
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Создан: {formatDate(domain.created_at)}</div>
          <div>Истекает: {formatDate(domain.expiry_date)}</div>
        </div>
      </CardContent>
    </Card>
  );

  const EmailCard = ({ email }: { email: EmailAccount }) => (
    <Card key={email.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{email.email}</span>
          </div>
          <Badge variant="outline" className={
            email.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }>
            {email.status === 'active' ? 'Активен' : 'Приостановлен'}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Использовано</span>
              <span>{email.used} / {email.quota}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${(parseFloat(email.used) / parseFloat(email.quota)) * 100}%`
                }}
              />
            </div>
          </div>
          {email.last_login && (
            <div>Последний вход: {formatDate(email.last_login)}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Статистика на основе реальных данных
  const stats = {
    servers: hosting.servers?.length || 0,
    domains: hosting.servers?.reduce((acc, server) => acc + server.domains.length, 0) || 0,
    emails: hosting.servers?.reduce((acc, server) => acc + server.email_accounts.length, 0) || 0,
    onlineServers: hosting.servers?.filter(s => s.status === 'online').length || 0,
  };

  return (


    <div className="container mx-auto px-4 py-6">
      {/* Хлебные крошки и заголовок */}
      <div className="mb-6">
        <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/hostings')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к хостингам
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{hosting.name}</h1>
                <Badge variant="outline" className={`${getStatusColor(hosting.status)} w-fit`}>
                  {getStatusText(hosting.status)}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {hosting.provider} • {hosting.plan}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(hosting.login_url, '_blank')}
              className="flex-1 sm:flex-none"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Панель управления
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/hostings/edit/${hosting.id}`)}
              className="flex-1 sm:flex-none"
            >
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Удалить
            </Button>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Левая колонка - Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="servers">Серверы</TabsTrigger>
              <TabsTrigger value="domains">Домены & Почта</TabsTrigger>
            </TabsList>

            {/* Вкладка Обзор */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    Основная информация
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow icon={Server} label="Название" value={hosting.name} />
                  <InfoRow icon={Shield} label="Провайдер" value={hosting.provider} />
                  <InfoRow icon={Server} label="Тарифный план" value={hosting.plan} />
                  <InfoRow icon={Globe} label="IP адрес" value={hosting.ip} copyable />

                  <Separator />

                  <InfoRow icon={Calendar} label="Дата создания" value={formatDate(hosting.created_at)} />
                  <InfoRow icon={Calendar} label="Действует до" value={formatDate(hosting.expiry_date)} />
                </CardContent>
              </Card>

              {/* Данные для подключения */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Данные для подключения
                  </CardTitle>
                  <CardDescription>
                    Конфиденциальная информация для доступа к хостингу
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow icon={ExternalLink} label="URL для входа" value={hosting.login_url} copyable />
                  <InfoRow icon={Server} label="Имя пользователя" value={hosting.username} copyable />
                  <InfoRow icon={Shield} label="Пароль" value={hosting.password} copyable />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка Серверы */}
            <TabsContent value="servers" className="space-y-6">
              {hosting.servers && hosting.servers.length > 0 ? (
                hosting.servers.map(server => (
                  <Card key={server.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Server className="w-5 h-5" />
                          {server.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${server.status === 'online' ? 'bg-green-500' :
                            server.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />
                          <Badge variant="outline">
                            {server.status === 'online' ? 'Online' :
                              server.status === 'offline' ? 'Offline' : 'Maintenance'}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>IP: {server.ip}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Cpu className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">CPU</div>
                            <div className="text-sm text-muted-foreground">{server.cpu}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <MemoryStick className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">RAM</div>
                            <div className="text-sm text-muted-foreground">{server.ram}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <HardDrive className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Хранилище</div>
                            <div className="text-sm text-muted-foreground">{server.storage}</div>
                          </div>
                        </div>
                      </div>

                      <InfoRow icon={Server} label="Операционная система" value={server.os} />
                      <InfoRow icon={Calendar} label="Создан" value={formatDate(server.created_at)} />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Server className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Серверы не найдены</h3>
                    <p className="text-muted-foreground">На этом хостинге нет серверов</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Вкладка Домены & Почта */}
            <TabsContent value="domains" className="space-y-6">
              {/* Домены */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Доменные имена
                  </CardTitle>
                  <CardDescription>
                    {stats.domains} доменов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {hosting.servers?.map(server =>
                      server.domains.map(domain => (
                        <DomainCard key={domain.id} domain={domain} />
                      ))
                    )}
                    {stats.domains === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Globe className="w-12 h-12 mx-auto mb-4" />
                        Домены не найдены
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Почтовые ящики */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Почтовые ящики
                  </CardTitle>
                  <CardDescription>
                    {stats.emails} почтовых ящиков
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {hosting.servers?.map(server =>
                      server.email_accounts.map(email => (
                        <EmailCard key={email.id} email={email} />
                      ))
                    )}
                    {stats.emails === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Mail className="w-12 h-12 mx-auto mb-4" />
                        Почтовые ящики не найдены
                      </div>
                    )}
                  </div>
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
                  <div className="text-2xl font-bold">{stats.servers}</div>
                  <div className="text-xs text-muted-foreground">Серверов</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{stats.domains}</div>
                  <div className="text-xs text-muted-foreground">Доменов</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{stats.emails}</div>
                  <div className="text-xs text-muted-foreground">Почт. ящиков</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.onlineServers}</div>
                  <div className="text-xs text-muted-foreground">Online</div>
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
                <Shield className="w-4 h-4 mr-2" />
                Сменить пароль
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Globe className="w-4 h-4 mr-2" />
                Добавить домен
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Создать почту
              </Button>
            </CardContent>
          </Card>

          {/* Информация о статусе */}
          <Card>
            <CardHeader>
              <CardTitle>Состояние системы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Хостинг</span>
                <Badge variant="outline" className={getStatusColor(hosting.status)}>
                  {getStatusText(hosting.status)}
                </Badge>
              </div>
              {hosting.servers?.map(server => (
                <div key={server.id} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1 mr-2" title={server.name}>
                    {server.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${server.status === 'online' ? 'bg-green-500' :
                      server.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                    <span className="text-xs text-muted-foreground">
                      {server.status === 'online' ? 'Online' :
                        server.status === 'offline' ? 'Offline' : 'Maintenance'}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HostingDetail;