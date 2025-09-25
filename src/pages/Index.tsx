import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import { Send, Package, FileText, Plus, TrendingUp, Bell, CheckCircle2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useTasks } from '@/hooks/useTasks';
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const {
    loading: tasksLoading,
  } = useTasks();

  const { items: notifications, markAsRead } = useNotifications();

  const { user } = useAuth();

  // Статистика
  const totalTasks = user.tasks.length;
  const submittedTasks = user.tasks.filter(t => t.status === 'submitted').length;
  const completedTasks = user.tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = user.tasks.filter(t => t.status === 'in_progress').length;

  // Последние задачи
  const recentNotify = notifications.filter(n => !n.is_read).slice(0, 3);
  const recentMyTasks = user.tasks.slice(0, 3);
  const recentTasks = user.getAvailableTasksAttribute.slice(0, 5);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const stats = [
    { label: 'Всего задач', value: totalTasks.toString(), icon: FileText, color: 'text-primary' },
    { label: 'В работе', value: inProgressTasks.toString(), icon: TrendingUp, color: 'text-warning' },
    { label: 'Выполнено', value: completedTasks.toString(), icon: Package, color: 'text-success' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center bg-gradient-to-r from-primary/5 to-primary-glow/5 border border-primary/10 rounded-xl p-8">
            <img src={user?.photo_url} alt={`Фото пользователя ${user?.first_name}`} className="rounded-full w-24 h-24 object-cover me-4" />
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Добро пожаловать, {user?.first_name || 'Пользователь'}!
              </h1>
              <p className="text-muted-foreground text-lg">Управляйте документооборотом и отгрузками эффективно</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-background to-muted/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <Card className="mb-8 border-0 bg-gradient-to-br from-background via-muted/30 to-background">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <span>Последние уведомления ({unreadCount})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotify.map((notification) => {
                  return (
                    <Card
                      key={notification.id}
                      className={`hover:shadow-md transition-shadow cursor-pointer ${!notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                        }`}
                      onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 overflow-hidden">
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
            </CardContent>
          </Card>
        )}


        {/* Quick Actions */}
        <Card className="mb-8 border-0 bg-gradient-to-br from-background via-muted/30 to-background">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <span>Быстрые действия</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button className="h-24 p-6 flex-col space-y-3 hover:scale-105 transition-all duration-300 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 border-primary/20" variant="outline" asChild>
                <Link to="/create-task">
                  <Send className="w-8 h-8 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold">Создать отправку</div>
                    <div className="text-xs text-muted-foreground">Отправка документов</div>
                  </div>
                </Link>
              </Button>

              <Button disabled className="h-24 p-6 flex-col space-y-3 hover:scale-105 transition-all duration-300 bg-gradient-to-br from-success/5 to-success/10 hover:from-success/10 hover:to-success/20 border-success/20" variant="outline" asChild>
                <Link to="/create-shipment">
                  <Package className="w-8 h-8 text-success" />
                  <div className="text-center">
                    <div className="font-semibold">Создать отгрузку</div>
                    <div className="text-xs text-muted-foreground">Отгрузка товара</div>
                  </div>
                </Link>
              </Button>

              <Button disabled className="h-24 p-6 flex-col space-y-3 hover:scale-105 transition-all duration-300 bg-gradient-to-br from-warning/5 to-warning/10 hover:from-warning/10 hover:to-warning/20 border-warning/20" variant="outline" asChild>
                <Link to="/create-task">
                  <FileText className="w-8 h-8 text-warning" />
                  <div className="text-center">
                    <div className="font-semibold">Сделать скан</div>
                    <div className="text-xs text-muted-foreground">Сканирование документов</div>
                  </div>
                </Link>
              </Button>

              <Button disabled className="h-24 p-6 flex-col space-y-3 hover:scale-105 transition-all duration-300 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 border-primary/20" variant="outline" asChild>
                <Link to="/create-task">
                  <Send className="w-8 h-8 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold">Создать счет</div>
                    <div className="text-xs text-muted-foreground">Создать счет на оплату</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Мои задачи</span>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tasks">Показать все</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Загрузка задач...</p>
              </div>
            ) : recentMyTasks.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentMyTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">У вас пока нет задач</p>
                <Button className="mt-4" asChild>
                  <Link to="/create-task">Создать первую задачу</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Задачи</span>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tasks/all">Показать все</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Загрузка задач...</p>
              </div>
            ) : recentTasks.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Пока нет задач</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;