import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { MoreHorizontal, Plus, Search, Shield, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "moderator" | "user";
    status: "active" | "inactive" | "banned";
    lastSeen: string;
    createdAt: string;
}

const mockUsers: User[] = [
    {
        id: "1",
        name: "Анна Петрова",
        email: "anna@company.ru",
        role: "admin",
        status: "active",
        lastSeen: "Онлайн",
        createdAt: "2024-01-15"
    },
    {
        id: "2",
        name: "Михаил Сидоров",
        email: "mikhail@company.ru",
        role: "moderator",
        status: "active",
        lastSeen: "2 часа назад",
        createdAt: "2024-02-20"
    },
    {
        id: "3",
        name: "Елена Волкова",
        email: "elena@company.ru",
        role: "user",
        status: "active",
        lastSeen: "Вчера",
        createdAt: "2024-03-10"
    },
    {
        id: "4",
        name: "Дмитрий Козлов",
        email: "dmitry@company.ru",
        role: "user",
        status: "inactive",
        lastSeen: "Неделю назад",
        createdAt: "2024-01-05"
    },
    {
        id: "5",
        name: "Ольга Смирнова",
        email: "olga@company.ru",
        role: "user",
        status: "banned",
        lastSeen: "Месяц назад",
        createdAt: "2023-12-15"
    }
];

const createUserSchema = z.object({
    name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
    email: z.string().email("Введите корректный email"),
    role: z.enum(["admin", "moderator", "user"], {
        required_error: "Выберите роль пользователя",
    }),
    status: z.enum(["active", "inactive"], {
        required_error: "Выберите статус пользователя",
    }),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

const getRoleBadgeVariant = (role: string) => {
    switch (role) {
        case "admin": return "destructive";
        case "moderator": return "default";
        default: return "secondary";
    }
};

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case "active": return "default";
        case "inactive": return "secondary";
        case "banned": return "destructive";
        default: return "secondary";
    }
};

const getRoleLabel = (role: string) => {
    switch (role) {
        case "admin": return "Администратор";
        case "moderator": return "Модератор";
        case "user": return "Пользователь";
        default: return role;
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case "active": return "Активен";
        case "inactive": return "Неактивен";
        case "banned": return "Заблокирован";
        default: return status;
    }
};

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<CreateUserForm>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            role: "user",
            status: "active",
        },
    });

    const filteredUsers = users.filter(
        user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRoleChange = (userId: string, newRole: "admin" | "moderator" | "user") => {
        setUsers(users.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
        ));
    };

    const handleStatusChange = (userId: string, newStatus: "active" | "inactive" | "banned") => {
        setUsers(users.map(user =>
            user.id === userId ? { ...user, status: newStatus } : user
        ));
    };

    const onSubmit = (data: CreateUserForm) => {
        const newUser: User = {
            id: (users.length + 1).toString(),
            name: data.name,
            email: data.email,
            role: data.role,
            status: data.status,
            lastSeen: "Только что",
            createdAt: new Date().toISOString().split('T')[0]
        };

        setUsers([...users, newUser]);
        form.reset();
        setIsCreateDialogOpen(false);

        toast({
            title: "Пользователь создан",
            description: `${data.name} успешно добавлен в систему`,
        });
    };

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
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить пользователя
                    </Button>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Поиск пользователей..."
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
                                    <TableHead>Роль</TableHead>
                                    <TableHead>Статус</TableHead>
                                    <TableHead>Последняя активность</TableHead>
                                    <TableHead>Дата регистрации</TableHead>
                                    <TableHead className="w-[70px]">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getRoleBadgeVariant(user.role)}>
                                                {getRoleLabel(user.role)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(user.status)}>
                                                {getStatusLabel(user.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.lastSeen}</TableCell>
                                        <TableCell>{user.createdAt}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")}>
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        Сделать админом
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, "moderator")}>
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        Сделать модератором
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, "user")}>
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        Сделать пользователем
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(user.id, user.status === "banned" ? "active" : "banned")}
                                                        className={user.status === "banned" ? "text-green-600" : "text-red-600"}
                                                    >
                                                        <UserX className="h-4 w-4 mr-2" />
                                                        {user.status === "banned" ? "Разблокировать" : "Заблокировать"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Создать нового пользователя</DialogTitle>
                            <DialogDescription>
                                Добавьте нового пользователя в систему. Введите все необходимые данные.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Имя пользователя</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Введите полное имя" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="example@company.ru" type="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Роль</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите роль" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="user">Пользователь</SelectItem>
                                                    <SelectItem value="moderator">Модератор</SelectItem>
                                                    <SelectItem value="admin">Администратор</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Статус</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите статус" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="active">Активен</SelectItem>
                                                    <SelectItem value="inactive">Неактивен</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateDialogOpen(false)}
                                    >
                                        Отмена
                                    </Button>
                                    <Button type="submit">Создать пользователя</Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>

    );
}