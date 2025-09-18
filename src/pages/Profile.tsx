import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { User2, LogOut, FileText, Package, Send, TrendingUp, Activity, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { tasks, loading } = useTasks();

  if (!user) return null;

  // Статистика
  const totalTasks = tasks.length;
  const submittedTasks = tasks.filter(t => t.status === 'submitted').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const draftTasks = tasks.filter(t => t.status === 'draft').length;

  // Последние задачи
  const recentTasks = tasks.slice(0, 6);

  const stats = [
    { label: 'Всего задач', value: totalTasks, icon: FileText, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'В работе', value: inProgressTasks, icon: TrendingUp, color: 'text-warning', bgColor: 'bg-warning/10' },
    { label: 'Отправлено', value: submittedTasks, icon: Send, color: 'text-blue-600', bgColor: 'bg-blue-600/10' },
    { label: 'Выполнено', value: completedTasks, icon: Package, color: 'text-success', bgColor: 'bg-success/10' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Черновик</Badge>;
      case 'submitted':
        return <Badge variant="default">Отправлено</Badge>;
      case 'in_progress':
        return <Badge variant="warning">В работе</Badge>;
      case 'completed':
        return <Badge variant="success">Выполнено</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Отменено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Мой профиль</h1>
          <p className="text-muted-foreground">Управляйте настройками вашего аккаунта и отслеживайте активность</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <Card className="bg-gradient-to-r from-background to-muted/30">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                        {user.first_name?.charAt(0)?.toUpperCase() || user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Пользователь'}
                      </h2>
                      {user.username && (
                        <p className="text-muted-foreground mb-2">@{user.username}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>ID: {user.telegram_id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" onClick={signOut} className="shrink-0">
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Статистика активности</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${stat.bgColor} hover:shadow-md transition-all`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-2 rounded-lg bg-background/50`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Недавние задачи</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/tasks">Все задачи</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Загрузка задач...</p>
                  </div>
                ) : recentTasks.length > 0 ? (
                  <div className="space-y-3">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer" 
                           onClick={() => window.location.href = `/task/${task.id}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex items-center space-x-2">
                                {task.task_type === 'send_docs' && <Send className="w-4 h-4 text-primary" />}
                                {task.task_type === 'make_scan' && <FileText className="w-4 h-4 text-primary" />}
                                {task.task_type === 'shipment' && <Package className="w-4 h-4 text-primary" />}
                                <h3 className="font-medium">
                                  {task.task_type === 'send_docs' && 'Отправка документов'}
                                  {task.task_type === 'make_scan' && 'Сканирование'}
                                  {task.task_type === 'shipment' && 'Отгрузка'}
                                </h3>
                              </div>
                              {getStatusBadge(task.status)}
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {task.description || 'Без описания'}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(task.created_at), 'd MMM, HH:mm', { locale: ru })}</span>
                              </div>
                              {task.city && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{task.city}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">У вас пока нет задач</h3>
                    <p className="text-muted-foreground mb-4">Создайте свою первую задачу, чтобы начать работу</p>
                    <Button asChild>
                      <Link to="/create-task">Создать задачу</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User2 className="w-5 h-5" />
                  <span>Информация аккаунта</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telegram ID</label>
                    <p className="text-foreground font-mono text-sm">{user.telegram_id}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="text-foreground">{user.username || 'Не указан'}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Полное имя</label>
                    <p className="text-foreground">{user.full_name || 'Не указано'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/create-task">
                    <Send className="w-4 h-4 mr-2" />
                    Создать отправку
                  </Link>
                </Button>
                
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/create-shipment">
                    <Package className="w-4 h-4 mr-2" />
                    Создать отгрузку
                  </Link>
                </Button>
                
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/tasks">
                    <FileText className="w-4 h-4 mr-2" />
                    Все задачи
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;