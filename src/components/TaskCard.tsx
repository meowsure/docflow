import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Package, Send, Calendar, MapPin, Eye, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Task } from "@/hooks/useTasks";

interface TaskCardProps {
  task: Task;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const TaskCard = ({ task, onDelete, isDeleting }: TaskCardProps) => {
  const getTaskIcon = () => {
    switch (task.task_type) {
      case 'send_docs':
        return <Send className="w-4 h-4" />;
      case 'make_scan':
        return <FileText className="w-4 h-4" />;
      case 'shipment':
        return <Package className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTaskTitle = () => {
    switch (task.task_type) {
      case 'send_docs':
        return 'Отправить документы';
      case 'make_scan':
        return 'Сделать скан';
      case 'shipment':
        return 'Отгрузка';
      default:
        return 'Задача';
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'draft':
        return 'secondary';
      case 'submitted':
        return 'warning';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case 'draft':
        return 'Черновик';
      case 'submitted':
        return 'Отправлено';
      case 'in_progress':
        return 'В работе';
      case 'completed':
        return 'Выполнено';
      default:
        return task.status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              {getTaskIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{getTaskTitle()}</h3>
              <p className="text-xs text-muted-foreground">ID: {task.id}</p>
            </div>
          </div>
          <Badge variant={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-foreground mb-3 line-clamp-2">
          {task.description || task.title || 'Без описания'}
        </p>
        
        <div className="space-y-2 text-xs text-muted-foreground">
          {task.city && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{task.city}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Создана: {formatDate(task.created_at)}</span>
          </div>
          
          {task.updated_at !== task.created_at && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Обновлена: {formatDate(task.updated_at)}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex justify-between gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/task/${task.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            Подробнее
          </Link>
        </Button>
        
        {onDelete && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onDelete}
            disabled={isDeleting}
            className="w-20"
          >
            {isDeleting ? "..." : "Удалить"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TaskCard;