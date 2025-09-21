import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import { Search, Filter, Package, Send } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";

interface Task {
  id: string;
  type: "send_docs" | "make_scan" | "shipment";
  description: string;
  city?: string;
  created_at: string;
  status: "draft" | "submitted" | "completed";
  filesCount: number;
}

const TasksList = () => {
  const { tasks, loading, loadMore, hasMore, loadingMore } = useTasks();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const filterTasks = (tasks: Task[], type?: string) => {
    return tasks.filter((task) => {
      const matchesSearch = task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesType = !type || task.type === type;
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const sendingTasks = filterTasks(tasks.filter((t) => t.type === "send_docs" || t.type === "make_scan"));
  const shipmentTasks = filterTasks(tasks.filter((t) => t.type === "shipment"));

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
                  <SelectItem value="completed">Выполненные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center text-muted-foreground py-10">Загрузка задач...</div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default TasksList;
