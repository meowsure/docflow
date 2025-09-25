import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Send, Calendar, User, AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import api from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles } from "@/hooks/useRoles";

interface Notification {
    id: number;
    title: string;
    message: string;
    type: "maintenance" | "announcement" | "warning" | "update";
    priority: "low" | "medium" | "high" | "urgent";
    recipients: "all" | "admins" | "users" | "specific";
    recipientCount: number;
    sentAt: string;
    sentBy: string;
    status: "sent" | "scheduled" | "draft";
}

const mockNotifications: Notification[] = [
    {
        id: 1,
        title: "Плановое техническое обслуживание",
        message: "Уважаемые пользователи! 15 марта с 02:00 до 06:00 будет проводиться плановое техническое обслуживание системы. Возможны временные перебои в работе.",
        type: "maintenance",
        priority: "high",
        recipients: "all",
        recipientCount: 156,
        sentAt: "2024-03-10 14:30",
        sentBy: "Системный администратор",
        status: "sent"
    },
    {
        id: 2,
        title: "Новые возможности в системе",
        message: "Добавлены новые функции для работы с документами и улучшена система уведомлений.",
        type: "update",
        priority: "medium",
        recipients: "all",
        recipientCount: 156,
        sentAt: "2024-03-08 10:15",
        sentBy: "Администратор",
        status: "sent"
    },
    {
        id: 3,
        title: "Важное обновление безопасности",
        message: "Рекомендуется сменить пароли доступа к системе в связи с обновлением системы безопасности.",
        type: "warning",
        priority: "urgent",
        recipients: "all",
        recipientCount: 156,
        sentAt: "2024-03-05 16:45",
        sentBy: "Администратор безопасности",
        status: "sent"
    }
];

const AdminNotifications = () => {
    const { user: currentUser } = useAuth();
    const { items: roles } = useRoles();
    const [notifications] = useState<Notification[]>(mockNotifications);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newNotification, setNewNotification] = useState({
        title: "",
        message: "",
        type: "system" as const,
        priority: "high" as const,
        recipients: "all" as const
    });
    const { toast } = useToast();

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "maintenance":
                return <AlertTriangle className="h-4 w-4" />;
            case "announcement":
                return <Info className="h-4 w-4" />;
            case "warning":
                return <AlertCircle className="h-4 w-4" />;
            case "update":
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "maintenance":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "announcement":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "warning":
                return "bg-red-100 text-red-800 border-red-200";
            case "update":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "bg-red-100 text-red-800 border-red-200";
            case "high":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case "maintenance":
                return "Техобслуживание";
            case "announcement":
                return "Объявление";
            case "warning":
                return "Предупреждение";
            case "update":
                return "Обновление";
            default:
                return type;
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "Срочно";
            case "high":
                return "Высокий";
            case "medium":
                return "Средний";
            case "low":
                return "Низкий";
            default:
                return priority;
        }
    };

    const getRecipientsText = (recipients: string) => {
        switch (recipients) {
            case "all":
                return "Все пользователи";
            case "admins":
                return "Администраторы";
            case "users":
                return "Обычные пользователи";
            case "specific":
                return "Выборочно";
            default:
                return recipients;
        }
    };

    const handleCreateNotification = async () => {
        if (!currentUser.role.permissions_codes.includes('notify_all')) {
            toast({
                title: "Ошибка!",
                description: "Недостаточно прав!",
            });
            return;
        }

        if (!newNotification.title || !newNotification.message) {
            toast({
                title: "Ошибка",
                description: "Заполните все обязательные поля",
                variant: "destructive",
            });
            return;
        }

        try {
            const notify = await api.post('/admin/notifications', {
                'type': newNotification.type,
                'title': newNotification.title,
                'body': newNotification.message,
                'role_group': newNotification.recipients
            });

            toast({
                title: "Уведомление отправлено",
                description: `Уведомление "${newNotification.title}" успешно отправлено всем пользователям`,
            });

            setNewNotification({
                title: "",
                message: "",
                type: "system",
                priority: "high",
                recipients: "all"
            });
            setIsCreateDialogOpen(false);

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: error.message || error,
            });
            // toast({
            //     title: "Уведомление не отправлено",
            //     description: `Уведомление "${newNotification.title}" не может быть отправлено всем пользователям`,
            // });
        }


    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto py-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Управление уведомлениями</h1>
                        <p className="text-muted-foreground">
                            Создавайте и отправляйте уведомления пользователям системы
                        </p>
                    </div>
                    {currentUser.role.permissions_codes.includes('notify_all') && (
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Создать уведомление
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Создать новое уведомление</DialogTitle>
                                    <DialogDescription>
                                        Заполните форму для отправки уведомления пользователям
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Заголовок *</Label>
                                        <Input
                                            id="title"
                                            placeholder="Введите заголовок уведомления"
                                            value={newNotification.title}
                                            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Сообщение *</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Введите текст уведомления"
                                            rows={4}
                                            value={newNotification.message}
                                            onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Тип уведомления</Label>
                                            <Select value={newNotification.type} onValueChange={(value: any) => setNewNotification({ ...newNotification, type: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите тип" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="system">Системное</SelectItem>
                                                    <SelectItem value="maintenance">Техобслуживание</SelectItem>
                                                    <SelectItem value="warning">Предупреждение</SelectItem>
                                                    <SelectItem value="update">Обновление</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Приоритет</Label>
                                            <Select value={newNotification.priority} onValueChange={(value: any) => setNewNotification({ ...newNotification, priority: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите приоритет" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Низкий</SelectItem>
                                                    <SelectItem value="medium">Средний</SelectItem>
                                                    <SelectItem value="high">Высокий</SelectItem>
                                                    <SelectItem value="urgent">Срочно</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="recipients">Получатели</Label>
                                            <Select value={newNotification.recipients} onValueChange={(value: any) => setNewNotification({ ...newNotification, recipients: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите получателей" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Все пользователи</SelectItem>
                                                    {roles && roles.map((role) => (
                                                        <SelectItem value={role.name}>{role.name}</SelectItem>
                                                    ))}

                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Отмена
                                    </Button>
                                    <Button onClick={handleCreateNotification}>
                                        <Send className="h-4 w-4 mr-2" />
                                        Отправить уведомление
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                </div>

                {/* Статистика */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Всего отправлено</CardTitle>
                            <Send className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{notifications.length}</div>
                            <p className="text-xs text-muted-foreground">за всё время</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Активных пользователей</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">156</div>
                            <p className="text-xs text-muted-foreground">получили уведомления</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Срочных уведомлений</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">за последние 30 дней</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Техобслуживание</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">запланировано</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Список отправленных уведомлений */}
                <Card>
                    <CardHeader>
                        <CardTitle>Отправленные уведомления</CardTitle>
                        <CardDescription>
                            История всех отправленных уведомлений пользователям системы
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className="flex-shrink-0">
                                            {getTypeIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-semibold">{notification.title}</h4>
                                                <Badge variant="outline" className={getTypeColor(notification.type)}>
                                                    {getTypeText(notification.type)}
                                                </Badge>
                                                <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                                                    {getPriorityText(notification.priority)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{notification.sentAt}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <User className="h-3 w-3" />
                                                    <span>{notification.sentBy}</span>
                                                </div>
                                                <div>
                                                    {getRecipientsText(notification.recipients)} ({notification.recipientCount} чел.)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={notification.status === "sent" ? "default" : "secondary"}>
                                        {notification.status === "sent" ? "Отправлено" : "Черновик"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

    );
};

export default AdminNotifications;