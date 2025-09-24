import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, Shield, RefreshCw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { useUsers, User } from "@/hooks/useUsers";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/api";

// Интерфейс для роли
interface Role {
    id: string;
    name: string;
    // Другие поля, если есть
}

const AdminUsers = () => {
    const { items: users, loading, refetch } = useUsers();
    const [searchQuery, setSearchQuery] = useState("");
    const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({});
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const { toast } = useToast();

    // Загрузка доступных ролей
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await api.get("/roles");
                setAvailableRoles(response.data.data || response.data || []);
            } catch (error) {
                console.error("Ошибка при загрузке ролей:", error);
                toast({
                    variant: "destructive",
                    title: "Ошибка",
                    description: error.response?.data?.message || "Ошибка при загрузке ролей",
                });
                // Fallback к базовым ролям
                setAvailableRoles([
                    { id: "1", name: "admin" },
                    { id: "2", name: "moderator" },
                    { id: "3", name: "user" },
                ]);
            }
        };

        fetchRoles();
    }, []);

    const filteredUsers = users.filter(
        (user) =>
            user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activateUser = async (userId: string) => {
        if (!confirm("Вы уверены, что хотите активировать этого пользователя?")) {
            return;
        }
        setIsUpdating((prev) => ({ ...prev, [userId]: true }));
        try {
            const response = await api.put(`/users/${userId}/activate`);

            if (response.data.message) {
                toast({
                    title: "✅ Пользователь активирован",
                    description: response.data.message,
                });
            }

            // Обновляем данные
            refetch();
        } catch (error: any) {
            console.error("Ошибка при активации пользователя:", error);
            toast({
                variant: "destructive",
                title: "❌ Ошибка активации",
                description: error.response?.data?.message || "Не удалось активировать пользователя",
            });
        } finally {
            setIsUpdating((prev) => ({ ...prev, [userId]: false }));
        }
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        setIsUpdating((prev) => ({ ...prev, [userId]: true }));

        try {
            const response = await api.put(`/users/${userId}/role`, { role: newRole });

            if (response.data.message) {
                toast({
                    title: "Роль обновлена",
                    description: response.data.message,
                });
            }

            // Обновляем данные
            refetch();
        } catch (error: any) {
            console.error("Ошибка при обновлении роли:", error);
            toast({
                variant: "destructive",
                title: "Ошибка",
                description: error.response?.data?.message || "Не удалось обновить роль пользователя",
            });
        } finally {
            setIsUpdating((prev) => ({ ...prev, [userId]: false }));
        }
    };

    const getRoleBadgeVariant = (roleName: string) => {
        switch (roleName) {
            case "admin":
                return "destructive";
            case "moderator":
                return "default";
            case "user":
                return "secondary";
            default:
                return "secondary";
        }
    };

    const getRoleLabel = (roleName: string) => {
        switch (roleName) {
            case "admin":
                return "Администратор";
            case "moderator":
                return "Модератор";
            case "user":
                return "Пользователь";
            default:
                return roleName;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading && users.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>

                    <div className="mb-6">
                        <Skeleton className="h-10 w-full" />
                    </div>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Управление пользователями</h1>
                        <p className="text-muted-foreground">
                            Управляйте пользователями и их ролями в системе
                        </p>
                    </div>
                    <Button onClick={() => refetch()} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Обновить
                    </Button>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Поиск пользователей по имени, email или username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Пользователи системы</CardTitle>
                        <CardDescription>
                            Всего пользователей: {users.length}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Пользователь</TableHead>
                                    <TableHead>Telegram</TableHead>
                                    <TableHead>Роль</TableHead>
                                    <TableHead>Дата регистрации</TableHead>
                                    <TableHead className="w-[100px]">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <img src={user.photo_url} alt="" className="w-14 h-14 rounded me-4" />
                                                <div>
                                                    <div className="font-medium">{user.full_name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {user.email || "Email не указан"}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>@{user.username || "не указан"}</div>
                                                <div className="text-muted-foreground">
                                                    ID: {user.telegram_id}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getRoleBadgeVariant(user.role?.name || "user")}
                                            >
                                                {getRoleLabel(user.role?.name || "user")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.created_at ? formatDate(user.created_at) : "Н/Д"}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>

                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        disabled={isUpdating[user.id]}
                                                    >
                                                        {isUpdating[user.id] ? (
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {availableRoles.map((role) => (
                                                        <DropdownMenuItem
                                                            key={role.id}
                                                            onClick={() =>
                                                                handleRoleChange(user.id, role.name)
                                                            }
                                                            disabled={
                                                                user.role?.name === role.name ||
                                                                isUpdating[user.id]
                                                            }
                                                        >
                                                            <Shield className="h-4 w-4 mr-2" />
                                                            Сделать {getRoleLabel(role.name)}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    {!user.isActive && (
                                                        <DropdownMenuItem
                                                            onClick={() => activateUser(user.id)}
                                                            disabled={isUpdating[user.id]}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" /> {/* Более подходящая иконка */}
                                                            Активировать аккаунт
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {filteredUsers.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">Пользователи не найдены</h3>
                            <p className="text-muted-foreground">
                                Попробуйте изменить поисковый запрос
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;