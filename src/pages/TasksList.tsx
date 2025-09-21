import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import { Search, Filter, Package, Send } from "lucide-react";
import { useTasks, Task } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const TasksList = () => {
  const { tasks, loading, loadingMore, hasMore, loadMore, deleteTask } = useTasks();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
        if (hasMore && !loadingMore) loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, loadMore]);

  const handleDeleteTask = async (taskId: string) => {
    setDeletingIds(prev => new Set(prev).add(taskId));
    try {
      const success = await deleteTask(taskId);
      if (success) {
        toast({
          title: "Задача удалена",
          description: "Задача успешно удалена",
        });
      }
    } catch (error) {
      // Error handling is already in the hook
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const filterTasks = (tasks: Task[], type?: string) => {
    return tasks.filter((task) => {
      const matchesSearch = task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesType = !type || task.task_type === type;
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const sendingTasks = filterTasks(tasks, "send_docs");
  const scanTasks = filterTasks(tasks, "make_scan");
  const shipmentTasks = filterTasks(tasks, "shipment");

  const allSendingTasks = [...sendingTasks, ...scanTasks];

  if (loading && tasks.length === 0) {
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
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="draft">Черновики</SelectItem>
                  <SelectItem value="submitted">Отправленные</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
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
              <span>Отправки ({allSendingTasks.length})</span>
            </TabsTrigger>
            <TabsTrigger value="shipments" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Отгрузки ({shipmentTasks.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sendings" className="space-y-6">
            {allSendingTasks.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allSendingTasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onDelete={() => handleDeleteTask(task.id)}
                      isDeleting={deletingIds.has(task.id)}
                    />
                  ))}
                </div>
                {loadingMore && (
                  <div className="flex justify-center mt-4">
                    <div className="text-muted-foreground">Загрузка...</div>
                  </div>
                )}
              </>
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
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shipmentTasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onDelete={() => handleDeleteTask(task.id)}
                      isDeleting={deletingIds.has(task.id)}
                    />
                  ))}
                </div>
                {loadingMore && (
                  <div className="flex justify-center mt-4">
                    <div className="text-muted-foreground">Загрузка...</div>
                  </div>
                )}
              </>
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