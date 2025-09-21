import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, AlertCircle, Info, CheckCircle, XCircle, Search } from "lucide-react";
import Header from "@/components/Header";

const Logs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const mockLogs = [
    {
      id: 1,
      timestamp: "2024-01-18 14:30:25",
      level: "info",
      action: "Пользователь вошёл в систему",
      user: "admin@example.com",
      ip: "192.168.1.100",
      details: "Успешная авторизация через Telegram"
    },
    {
      id: 2,
      timestamp: "2024-01-18 14:25:10",
      level: "success",
      action: "Создана отгрузка",
      user: "manager@example.com",
      ip: "192.168.1.101",
      details: "Отгрузка ОТГ-2024-001 успешно создана"
    },
    {
      id: 3,
      timestamp: "2024-01-18 14:20:45",
      level: "warning",
      action: "Неудачная попытка загрузки файла",
      user: "user@example.com",
      ip: "192.168.1.102",
      details: "Файл превышает максимальный размер 10MB"
    },
    {
      id: 4,
      timestamp: "2024-01-18 14:15:30",
      level: "error",
      action: "Ошибка подключения к базе данных",
      user: "system",
      ip: "localhost",
      details: "Превышено время ожидания подключения"
    },
    {
      id: 5,
      timestamp: "2024-01-18 14:10:15",
      level: "info",
      action: "Создана задача",
      user: "manager@example.com",
      ip: "192.168.1.101",
      details: "Задача 'Проверить документы' назначена пользователю"
    },
    {
      id: 6,
      timestamp: "2024-01-18 14:05:00",
      level: "success",
      action: "Задача выполнена",
      user: "user@example.com",
      ip: "192.168.1.103",
      details: "Задача 'Подготовить отчёт' помечена как выполненная"
    }
  ];

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

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || log.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const logCounts = mockLogs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
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

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск в логах..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Уровень" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все уровни</SelectItem>
            <SelectItem value="error">Ошибки</SelectItem>
            <SelectItem value="warning">Предупреждения</SelectItem>
            <SelectItem value="success">Успешно</SelectItem>
            <SelectItem value="info">Информация</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getLevelIcon(log.level)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{log.action}</h3>
                    <Badge className={getLevelColor(log.level)}>
                      {log.level.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.details}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{log.timestamp}</span>
                    <span>Пользователь: {log.user}</span>
                    <span>IP: {log.ip}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
  );
};

export default Logs;