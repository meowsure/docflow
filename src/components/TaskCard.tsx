import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Package, Send, Calendar, MapPin, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface TaskCardProps {
  task: {
    id: number;
    type: 'send_docs' | 'make_scan' | 'shipment';
    description: string;
    city?: string;
    createdAt: string;
    status: 'draft' | 'submitted' | 'completed' | 'in_progress' | 'cancelled';
    filesCount: number;
  };
}

const TaskCard = ({ task }: TaskCardProps) => {
  const getTaskIcon = () => {
    switch (task.type) {
      case 'send_docs':
        return <Send className="w-4 h-4" />;
      case 'make_scan':
        return <FileText className="w-4 h-4" />;
      case 'shipment':
        return <Package className="w-4 h-4" />;
    }
  };

  const getTaskTitle = () => {
    switch (task.type) {
      case 'send_docs':
        return 'Отправить документы';
      case 'make_scan':
        return 'Сделать скан';
      case 'shipment':
        return 'Отгрузка';
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
      case 'cancelled':
        return 'destructive';
    }
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
            {task.status === 'draft' && 'Черновик'}
            {task.status === 'submitted' && 'Отправлено'}
            {task.status === 'in_progress' && 'В работе'}
            {task.status === 'completed' && 'Выполнено'}
            {task.status === 'cancelled' && 'Отменено'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-foreground mb-3 line-clamp-2">{task.description}</p>
        
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{task.createdAt}</span>
          </div>
          {task.city && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{task.city}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>{task.filesCount} файлов</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to={`/task/${task.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            Подробнее
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;