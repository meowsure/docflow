import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import ShipmentCard from "@/components/ShipmentCard";
import { Search, Filter, Package, Send } from "lucide-react";
import { useTasks, Task } from "@/hooks/useTasks";
import { useShipments, Shipment } from "@/hooks/useShipments";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const TasksList = () => {
  const {
    tasks,
    loading: tasksLoading,
    loadingMore: tasksLoadingMore,
    hasMore: tasksHasMore,
    loadMore: tasksLoadMore,
    deleteTask,
  } = useTasks();

  const {
    items: shipments,
    loading: shipmentsLoading,
    loadingMore: shipmentsLoadingMore,
    hasMore: shipmentsHasMore,
    loadMore: shipmentsLoadMore,
    deleteItem: deleteShipment,
  } = useShipments();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("sendings");
  const [deletingTaskIds, setDeletingTaskIds] = useState<Set<string>>(new Set());
  const [deletingShipmentIds, setDeletingShipmentIds] = useState<Set<string>>(new Set());

  // Обработчики для бесконечной прокрутки
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        if (activeTab === 'sendings' && tasksHasMore && !tasksLoadingMore) {
          tasksLoadMore();
        } else if (activeTab === 'shipments' && shipmentsHasMore && !shipmentsLoadingMore) {
          shipmentsLoadMore();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab, tasksHasMore, tasksLoadingMore, tasksLoadMore, shipmentsHasMore, shipmentsLoadingMore, shipmentsLoadMore]);

  // Обработчики удаления
  const handleDeleteTask = async (taskId: string) => {
    setDeletingTaskIds(prev => new Set(prev).add(taskId));
    try {
      const success = await deleteTask(taskId);
      if (success) {
        toast({
          title: "Задача удалена",
          description: "Задача успешно удалена",
        });
      }
    } catch (error) {
      // Обработка ошибок уже в хуке
    } finally {
      setDeletingTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleDeleteShipment = async (shipmentId: string) => {
    setDeletingShipmentIds(prev => new Set(prev).add(shipmentId));
    try {
      const success = await deleteShipment(shipmentId);
      if (success) {
        toast({
          title: "Отгрузка удалена",
          description: "Отгрузка успешно удалена",
        });
      }
    } catch (error) {
      // Обработка ошибок уже в хуке
    } finally {
      setDeletingShipmentIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(shipmentId);
        return newSet;
      });
    }
  };

  // Функции фильтрации для каждого типа данных
  const filterTasks = (tasks: Task[]) => {
    return tasks.filter((task) => {
      const matchesSearch =
        (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filterShipments = (shipments: Shipment[]) => {
    return shipments.filter((shipment) => {
      // Расширяем интерфейс Shipment для поддержки дополнительных полей
      const extendedShipment = shipment as any;
      const matchesSearch =
        extendedShipment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extendedShipment.external_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extendedShipment.from_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extendedShipment.to_location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      (shipment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (shipment.external_id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (shipment.from_location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (shipment.to_location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Определяем общее состояние загрузки
  const isLoading = (activeTab === "sendings" ? tasksLoading : shipmentsLoading) &&
    (activeTab === "sendings" ? tasks.length === 0 : shipments.length === 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-40">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Мои задачи и отгрузки</h1>
          <p className="text-muted-foreground">Управляйте всеми вашими задачами и отгрузками</p>
        </div>

        {/* Фильтры */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по описанию, названию или ID..."
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
                  <SelectItem value="draft">Черновики</SelectItem>
                  <SelectItem value="submitted">Отправленные</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="completed">Выполненные</SelectItem>
                  <SelectItem value="confirmed">Подтвержденные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sendings" className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Задачи ({filteredTasks.length})</span>
            </TabsTrigger>
            <TabsTrigger value="shipments" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Отгрузки ({filteredShipments.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sendings" className="space-y-6">
            {filteredTasks.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={() => handleDeleteTask(task.id)}
                      isDeleting={deletingTaskIds.has(task.id)}
                    />
                  ))}
                </div>
                {tasksLoadingMore && (
                  <div className="flex justify-center mt-4">
                    <div className="text-muted-foreground">Загрузка задач...</div>
                  </div>
                )}
                {tasksHasMore && !tasksLoadingMore && (
                  <div className="flex justify-center mt-4">
                    <Button onClick={tasksLoadMore}>Загрузить еще задачи</Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Send className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Нет задач</p>
                  <p className="text-muted-foreground">Создайте свою первую задачу</p>
                  <Button className="mt-4">Создать задачу</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="shipments" className="space-y-6">
            {filteredShipments.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredShipments.map((shipment) => (
                    <ShipmentCard
                      key={shipment.id}
                      shipment={shipment}
                      onDelete={() => handleDeleteShipment(shipment.id)}
                      isDeleting={deletingShipmentIds.has(shipment.id)}
                    />
                  ))}
                </div>
                {shipmentsLoadingMore && (
                  <div className="flex justify-center mt-4">
                    <div className="text-muted-foreground">Загрузка отгрузок...</div>
                  </div>
                )}
                {shipmentsHasMore && !shipmentsLoadingMore && (
                  <div className="flex justify-center mt-4">
                    <Button onClick={shipmentsLoadMore}>Загрузить еще отгрузки</Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Нет отгрузок</p>
                  <p className="text-muted-foreground">Создайте свою первую отгрузку</p>
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