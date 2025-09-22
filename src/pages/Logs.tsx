import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, AlertCircle, Info, CheckCircle, XCircle, Search, User, Calendar, Activity } from "lucide-react";
import Header from "@/components/Header";
import { useLogs } from "@/hooks/useLogs";
import { Skeleton } from "@/components/ui/skeleton";
import InfiniteScroll from 'react-infinite-scroll-component';

const Logs = () => {
  const { items: logs, loading, loadingMore, hasMore, loadMore } = useLogs();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedEntity, setSelectedEntity] = useState("all");

  // Получаем уникальные действия и сущности для фильтров
  const uniqueActions = Array.from(new Set(logs.map(log => log.action))).sort();
  const uniqueEntities = Array.from(new Set(logs.map(log => log.entity_type))).sort();

  // Определяем уровень важности на основе действия
  const getLogLevel = (action: string) => {
    if (action.includes('error') || action.includes('fail') || action.includes('delete')) {
      return "error";
    } else if (action.includes('warn') || action.includes('invalid')) {
      return "warning";
    } else if (action.includes('success') || action.includes('complete') || action.includes('confirm')) {
      return "success";
    } else {
      return "info";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user?.full_name && log.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.meta).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = selectedAction === "all" || log.action === selectedAction;
    const matchesEntity = selectedEntity === "all" || log.entity_type === selectedEntity;

    return matchesSearch && matchesAction && matchesEntity;
  });

  // Подсчет логов по уровням
  const logCounts = filteredLogs.reduce((acc, log) => {
    const level = getLogLevel(log.action);
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Бесконечная прокрутка
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        if (hasMore && !loadingMore) loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, loadMore]);

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-5 mb-2" />
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-6 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-3 w-1/2" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Логи системы</h1>
            <p className="text-muted-foreground">Мониторинг активности и событий</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Ошибки</p>
                  <p className="text-2xl font-bold text-red-600">{logCounts.error || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Предупреждения</p>
                  <p className="text-2xl font-bold text-yellow-600">{logCounts.warning || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Успешно</p>
                  <p className="text-2xl font-bold text-green-600">{logCounts.success || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Информация</p>
                  <p className="text-2xl font-bold text-blue-600">{logCounts.info || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по действию, сущности, пользователю или IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Все действия" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все действия</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>{action}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedEntity} onValueChange={setSelectedEntity}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Все сущности" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все сущности</SelectItem>
              {uniqueEntities.map(entity => (
                <SelectItem key={entity} value={entity}>{entity}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <InfiniteScroll
          dataLength={filteredLogs.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<div className="text-center py-4">Загрузка...</div>}
          endMessage={<div className="text-center py-4 text-muted-foreground">Это все логи</div>}
        >
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const level = getLogLevel(log.action);
              return (
                <Card key={log.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getLevelIcon(level)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h3 className="font-medium">{log.action}</h3>
                          <div className="flex gap-2 flex-wrap">
                            <Badge className={getLevelColor(level)}>
                              {level.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {log.entity_type}
                            </Badge>
                          </div>
                        </div>

                        {log.meta && Object.keys(log.meta).length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {JSON.stringify(log.meta)}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(log.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.user?.full_name || `User #${log.user_id}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {log.ip}
                          </span>
                          {log.entity_id && (
                            <span className="flex items-center gap-1">
                              ID: {log.entity_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </InfiniteScroll>

        {filteredLogs.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Логи не найдены</h3>
              <p className="text-muted-foreground">Попробуйте изменить фильтры поиска</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Logs;