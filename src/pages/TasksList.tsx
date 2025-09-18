import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import { Search, Filter, Package, Send } from "lucide-react";

const TasksList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Моковые данные
  const allTasks = [
    {
      id: 1001,
      type: 'send_docs' as const,
      description: 'Отправить договор поставки в Москву срочно до 18:00',
      city: 'Москва',
      createdAt: '15 сент, 14:30',
      status: 'submitted' as const,
      filesCount: 3
    },
    {
      id: 1002,
      type: 'shipment' as const,
      description: 'Отгрузка товара со склада в Подольске. Паллеты с продукцией, общий вес 2,5 тонны',
      createdAt: '14 сент, 10:15',
      status: 'completed' as const,
      filesCount: 5
    },
    {
      id: 1003,
      type: 'make_scan' as const,
      description: 'Сканировать документы для налоговой отчетности',
      city: 'Москва',
      createdAt: '13 сент, 16:45',
      status: 'submitted' as const,
      filesCount: 8
    },
    {
      id: 1004,
      type: 'send_docs' as const,
      description: 'Отправить контракт с поставщиком в другой город',
      city: 'Другой город',
      createdAt: '12 сент, 11:20',
      status: 'completed' as const,
      filesCount: 2
    },
    {
      id: 1005,
      type: 'shipment' as const,
      description: 'Отгрузка строительных материалов',
      createdAt: '11 сент, 09:15',
      status: 'draft' as const,
      filesCount: 7
    }
  ];

  const filterTasks = (tasks: typeof allTasks, type?: string) => {
    return tasks.filter(task => {
      const matchesSearch = task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesType = !type || task.type === type;
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const sendingTasks = filterTasks(allTasks.filter(t => t.type === 'send_docs' || t.type === 'make_scan'));
  const shipmentTasks = filterTasks(allTasks.filter(t => t.type === 'shipment'));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Мои задачи</h1>
          <p className="text-muted-foreground">Управляйте всеми вашими отправками и отгрузками</p>
        </div>

        {/* Фильтры */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по описанию..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="draft">Черновики</SelectItem>
                  <SelectItem value="submitted">Отправленные</SelectItem>
                  <SelectItem value="completed">Выполненные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="sendings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sendings" className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Отправки ({sendingTasks.length})</span>
            </TabsTrigger>
            <TabsTrigger value="shipments" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Отгрузки ({shipmentTasks.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sendings" className="space-y-6">
            {sendingTasks.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sendingTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Send className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Нет отправок</p>
                  <p className="text-muted-foreground">Создайте свою первую отправку документов</p>
                  <Button className="mt-4">Создать отправку</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="shipments" className="space-y-6">
            {shipmentTasks.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shipmentTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Нет отгрузок</p>
                  <p className="text-muted-foreground">Создайте свою первую отгрузку товаров</p>
                  <Button className="mt-4">Создать отгрузку</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TasksList;