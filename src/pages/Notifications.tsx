import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, AlertCircle, Info, MessageSquare, Settings } from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Новая задача назначена",
      message: "Вам назначена задача 'Проверить документы поставщика'",
      type: "task",
      priority: "high",
      isRead: false,
      timestamp: "2024-01-18 14:30:00",
      from: "Менеджер Иванов"
    },
    {
      id: 2,
      title: "Отгрузка готова к отправке",
      message: "Отгрузка ОТГ-2024-001 прошла все проверки и готова к отправке",
      type: "shipment",
      priority: "medium",
      isRead: false,
      timestamp: "2024-01-18 13:45:00",
      from: "Система"
    },
    {
      id: 3,
      title: "Счёт оплачен",
      message: "Получена оплата по счёту СЧ-2024-001 на сумму 125 000 ₽",
      type: "payment",
      priority: "low",
      isRead: true,
      timestamp: "2024-01-18 12:20:00",
      from: "Банк"
    },
    {
      id: 4,
      title: "Файл загружен",
      message: "Пользователь загрузил новый документ 'Спецификация товаров.xlsx'",
      type: "file",
      priority: "low",
      isRead: true,
      timestamp: "2024-01-18 11:15:00",
      from: "Пользователь Петров"
    },
    {
      id: 5,
      title: "Системное обновление",
      message: "Запланировано техническое обслуживание на 20.01.2024 с 02:00 до 04:00",
      type: "system",
      priority: "medium",
      isRead: false,
      timestamp: "2024-01-17 16:00:00",
      from: "Администратор"
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "shipment":
        return <Bell className="h-4 w-4 text-green-500" />;
      case "payment":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "file":
        return <Info className="h-4 w-4 text-purple-500" />;
      case "system":
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Высокий";
      case "medium":
        return "Средний";
      case "low":
        return "Низкий";
      default:
        return "Обычный";
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Уведомления</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} непрочитанных уведомлений` : "Все уведомления прочитаны"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="h-4 w-4 mr-2" />
            Отметить всё как прочитанное
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Всего</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Непрочитанные</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Прочитанные</p>
                <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getTypeIcon(notification.type)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <Badge className={getPriorityColor(notification.priority)}>
                      {getPriorityText(notification.priority)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{notification.timestamp}</span>
                    <span>От: {notification.from}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет уведомлений</h3>
            <p className="text-muted-foreground">Новые уведомления появятся здесь</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications;