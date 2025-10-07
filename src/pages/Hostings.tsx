// pages/Hostings.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Server as ServerIcon,
  Search,
  Plus,
  Filter,
  Globe,
  Calendar,
  Loader2,
  Info
} from "lucide-react";
import { useHostings, Hosting, Server as ServerType } from '@/hooks/useHostings'; // Переименовали тип
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { AddHostingModal } from "@/components/AddHostingModal";

const Hostings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [hostings, setHostings] = useState<Hosting[]>([]);
  const [loading, setLoading] = useState(true);

  const { fetchHostings, deleteHosting } = useHostings();

  // Загрузка хостингов при монтировании компонента
  useEffect(() => {
    loadHostings();
  }, []);

  const loadHostings = async () => {
    try {
      setLoading(true);
      const data = await fetchHostings();
      setHostings(data);
    } catch (err) {
      console.error('Ошибка загрузки хостингов:', err);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список хостингов",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const filteredHostings = hostings.filter(hosting => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      hosting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hosting.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hosting.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hosting.ip && hosting.ip.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || hosting.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (hostingId: string) => { // Оставляем string для UUID
    if (window.confirm('Вы уверены, что хотите удалить этот хостинг? Все связанные серверы также будут удалены.')) {
      try {
        await deleteHosting(hostingId);
        loadHostings();
      } catch (error) {
        console.error('Ошибка при удалении хостинга:', error);
      }
    }
  }

  // Упрощенная статистика - используем только реальные данные
  const stats = {
    total: hostings.length,
    active: hostings.filter(h => h.status === 'active').length,
    suspended: hostings.filter(h => h.status === 'suspended').length,
    pending: hostings.filter(h => h.status === 'pending').length,
    totalServers: hostings.reduce((acc, hosting) => acc + (hosting.servers?.length || 0), 0),
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30 && daysDiff > 0;
  };

  const isExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Заголовок и кнопка */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Хостинги</h1>
          <p className="text-muted-foreground mt-1">Управление хостингами и серверами</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Добавить хостинг
        </Button>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию, провайдеру, IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="suspended">Приостановленные</SelectItem>
                <SelectItem value="pending">Ожидание</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего хостингов</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ServerIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Активные</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Серверов</p>
                <p className="text-2xl font-bold">{stats.totalServers}</p>
              </div>
              <ServerIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Приостановлены</p>
                <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
              </div>
              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Сетка хостингов */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredHostings.map((hosting) => (
          <Card key={hosting.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate" title={hosting.name}>
                    {hosting.name}
                  </CardTitle>
                  <CardDescription className="truncate">
                    {hosting.provider} • {hosting.plan}
                  </CardDescription>
                </div>
                <Badge variant="outline" className={`${getStatusColor(hosting.status)} whitespace-nowrap`}>
                  {getStatusText(hosting.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Основная информация */}
              <div className="space-y-2">
                {hosting.ip && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{hosting.ip}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Действует до: {formatDate(hosting.expiry_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>ID: {hosting.id}</span>
                </div>
              </div>

              {/* Серверы */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Серверы:</span>
                  <span className="text-muted-foreground">
                    {hosting.servers?.length || 0} шт.
                  </span>
                </div>
                {hosting.servers?.slice(0, 2).map(server => (
                  <div key={server.id} className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded">
                    <ServerIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate flex-1" title={server.name}>
                      {server.name}
                    </span>
                    <div className={`h-2 w-2 rounded-full ${server.status === 'online' ? 'bg-green-500' :
                        server.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                  </div>
                ))}
                {(hosting.servers?.length || 0) > 2 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{(hosting.servers?.length || 0) - 2} еще
                  </div>
                )}
              </div>

              {/* Кнопки действий */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => hosting.id && navigate(`/hostings/${hosting.id}`)}
                >
                  Подробнее
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => hosting.id && handleDelete(hosting.id)}
                >
                  Удалить
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddHostingModal
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) {
            loadHostings(); // Перезагружаем список после закрытия модального окна
          }
        }}
      />

      {/* Состояние пустого списка */}
      {!loading && filteredHostings.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ServerIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {hostings.length === 0 ? "Нет хостингов" : "Хостинги не найдены"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hostings.length === 0
                ? "Добавьте первый хостинг"
                : "Попробуйте изменить параметры фильтрации"
              }
            </p>
            {hostings.length === 0 && (
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить хостинг
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Hostings;