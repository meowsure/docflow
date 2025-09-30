import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, AlertCircle, MessageSquare, Settings, Package, FileText, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import { useNotifications } from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";


const Notifications = () => {
  const { items: notifications, loading, loadingMore, hasMore, loadMore, markAsRead, markAllAsRead } = useNotifications();
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Определяем иконку по типу уведомления
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task":
      case "TaskCreated":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "shipment":
      case "ShipmentCreated":
        return <Package className="h-4 w-4 text-green-500" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-yellow-500" />;
      case "file":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "system":
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Определяем приоритет по типу уведомления
  const getPriority = (type: string) => {
    switch (type) {
      case "system":
      case "TaskCreated":
      case "RoleUpdated":
      case "AccountActivated":
        return "high";
      case "shipment":
      case "ShipmentCreated":
        return "medium";
      case "payment":
      case "file":
      default:
        return "low";
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

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    await markAllAsRead();
    setIsMarkingAll(false);
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-48" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-5 mb-2" />
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-6 w-12" />
                </CardContent>
              </Card>
            ))}
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

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Уведомления</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} непрочитанных уведомлений` : "Все уведомления прочитаны"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" disabled={isMarkingAll}>
              {isMarkingAll ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  Обработка...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Отметить всё как прочитанное
                </>
              )}
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
          {notifications.map((notification) => {
            const priority = getPriority(notification.type);

            return (
              <Card
                key={notification.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${!notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                  }`}
                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 overflow-hidden">
                    {getTypeIcon(notification.type)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <Badge className={getPriorityColor(priority)}>
                          {getPriorityText(priority)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.body}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDate(notification.created_at)}</span>
                        {notification.user && (
                          <span>От: {notification.user.full_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {loadingMore && (
          <div className="flex justify-center">
            <div className="text-muted-foreground">Загрузка дополнительных уведомлений...</div>
          </div>
        )}

        {hasMore && !loadingMore && (
          <div className="flex justify-center">
            <Button onClick={loadMore}>Загрузить еще</Button>
          </div>
        )}

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