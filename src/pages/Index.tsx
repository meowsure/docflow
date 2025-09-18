import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import { Send, Package, FileText, Plus, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { tasks, loading } = useTasks();
  const { user } = useAuth();

  // Статистика
  const totalTasks = tasks.length;
  const submittedTasks = tasks.filter(t => t.status === 'submitted').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

  // Последние задачи
  const recentTasks = tasks.slice(0, 3);

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
          <div className="bg-gradient-to-r from-primary/5 to-primary-glow/5 border border-primary/10 rounded-xl p-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Добро пожаловать, {user?.first_name || 'Пользователь'}!
            </h1>
            <p className="text-muted-foreground text-lg">Управляйте документооборотом и отгрузками эффективно</p>
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
              
              <Button className="h-24 p-6 flex-col space-y-3 hover:scale-105 transition-all duration-300 bg-gradient-to-br from-success/5 to-success/10 hover:from-success/10 hover:to-success/20 border-success/20" variant="outline" asChild>
                <Link to="/create-shipment">
                  <Package className="w-8 h-8 text-success" />
                  <div className="text-center">
                    <div className="font-semibold">Создать отгрузку</div>
                    <div className="text-xs text-muted-foreground">Отгрузка товара</div>
                  </div>
                </Link>
              </Button>
              
              <Button className="h-24 p-6 flex-col space-y-3 hover:scale-105 transition-all duration-300 bg-gradient-to-br from-warning/5 to-warning/10 hover:from-warning/10 hover:to-warning/20 border-warning/20" variant="outline" asChild>
                <Link to="/create-task">
                  <FileText className="w-8 h-8 text-warning" />
                  <div className="text-center">
                    <div className="font-semibold">Сделать скан</div>
                    <div className="text-xs text-muted-foreground">Сканирование документов</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Недавние задачи</span>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tasks">Показать все</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Загрузка задач...</p>
              </div>
            ) : recentTasks.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentTasks.map((task) => (
                  <TaskCard key={task.id} task={{
                    id: parseInt(task.id),
                    type: task.task_type as 'send_docs' | 'make_scan' | 'shipment',
                    description: task.description || 'Без описания',
                    city: task.city || 'Не указан',
                    createdAt: new Date(task.created_at).toLocaleDateString('ru-RU'),
                    status: task.status as 'draft' | 'submitted' | 'in_progress' | 'completed' | 'cancelled',
                    filesCount: 0
                  }} />
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
      </main>
    </div>
  );
};

export default Index;