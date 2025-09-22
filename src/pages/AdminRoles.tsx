import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Shield, Users, Settings } from "lucide-react";
import Header from "@/components/Header";

interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
}

interface Role {
    id: string;
    name: string;
    description: string;
    userCount: number;
    permissions: string[];
    isSystem: boolean;
    createdAt: string;
}

const mockPermissions: Permission[] = [
    { id: "1", name: "Просмотр пользователей", description: "Возможность просматривать список пользователей", category: "Пользователи" },
    { id: "2", name: "Редактирование пользователей", description: "Возможность редактировать данные пользователей", category: "Пользователи" },
    { id: "3", name: "Удаление пользователей", description: "Возможность удалять пользователей", category: "Пользователи" },
    { id: "4", name: "Создание задач", description: "Возможность создавать новые задачи", category: "Задачи" },
    { id: "5", name: "Редактирование задач", description: "Возможность редактировать существующие задачи", category: "Задачи" },
    { id: "6", name: "Удаление задач", description: "Возможность удалять задачи", category: "Задачи" },
    { id: "7", name: "Управление отгрузками", description: "Полный доступ к модулю отгрузок", category: "Логистика" },
    { id: "8", name: "Просмотр финансов", description: "Доступ к финансовой отчетности", category: "Финансы" },
    { id: "9", name: "Редактирование счетов", description: "Возможность редактировать счета и платежи", category: "Финансы" },
    { id: "10", name: "Просмотр логов", description: "Доступ к системным логам", category: "Система" },
];

const mockRoles: Role[] = [
    {
        id: "1",
        name: "Администратор",
        description: "Полный доступ ко всем функциям системы",
        userCount: 2,
        permissions: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        isSystem: true,
        createdAt: "2024-01-01"
    },
    {
        id: "2",
        name: "Модератор",
        description: "Управление контентом и пользователями",
        userCount: 5,
        permissions: ["1", "2", "4", "5", "6"],
        isSystem: true,
        createdAt: "2024-01-01"
    },
    {
        id: "3",
        name: "Менеджер по логистике",
        description: "Управление отгрузками и логистическими процессами",
        userCount: 8,
        permissions: ["4", "5", "7"],
        isSystem: false,
        createdAt: "2024-02-15"
    },
    {
        id: "4",
        name: "Финансовый аналитик",
        description: "Доступ к финансовым данным и отчетности",
        userCount: 3,
        permissions: ["8", "9"],
        isSystem: false,
        createdAt: "2024-03-01"
    },
    {
        id: "5",
        name: "Сотрудник",
        description: "Базовые права для работы с задачами",
        userCount: 25,
        permissions: ["4"],
        isSystem: true,
        createdAt: "2024-01-01"
    }
];

export default function AdminRoles() {
    const [roles, setRoles] = useState<Role[]>(mockRoles);
    const [permissions] = useState<Permission[]>(mockPermissions);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState({
        name: "",
        description: "",
        permissions: [] as string[]
    });

    const handlePermissionToggle = (roleId: string, permissionId: string) => {
        setRoles(roles.map(role => {
            if (role.id === roleId && !role.isSystem) {
                const hasPermission = role.permissions.includes(permissionId);
                return {
                    ...role,
                    permissions: hasPermission
                        ? role.permissions.filter(p => p !== permissionId)
                        : [...role.permissions, permissionId]
                };
            }
            return role;
        }));
    };

    const handleCreateRole = () => {
        const role: Role = {
            id: (roles.length + 1).toString(),
            name: newRole.name,
            description: newRole.description,
            userCount: 0,
            permissions: newRole.permissions,
            isSystem: false,
            createdAt: new Date().toISOString().split('T')[0]
        };

        setRoles([...roles, role]);
        setNewRole({ name: "", description: "", permissions: [] });
        setIsCreateDialogOpen(false);
    };

    const groupedPermissions = permissions.reduce((acc, permission) => {
        if (!acc[permission.category]) {
            acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Управление ролями</h1>
                        <p className="text-muted-foreground">
                            Настройте роли и разрешения для пользователей системы
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Создать роль
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Создание новой роли</DialogTitle>
                                <DialogDescription>
                                    Создайте новую роль и назначьте необходимые разрешения
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="role-name">Название роли</Label>
                                    <Input
                                        id="role-name"
                                        value={newRole.name}
                                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                        placeholder="Введите название роли"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="role-description">Описание</Label>
                                    <Textarea
                                        id="role-description"
                                        value={newRole.description}
                                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                                        placeholder="Описание роли и её назначения"
                                    />
                                </div>
                                <div>
                                    <Label>Разрешения</Label>
                                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                                        <div key={category} className="mt-3">
                                            <h4 className="font-medium text-sm mb-2">{category}</h4>
                                            {perms.map((permission) => (
                                                <div key={permission.id} className="flex items-center space-x-2 mb-2">
                                                    <Switch
                                                        checked={newRole.permissions.includes(permission.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setNewRole({
                                                                    ...newRole,
                                                                    permissions: [...newRole.permissions, permission.id]
                                                                });
                                                            } else {
                                                                setNewRole({
                                                                    ...newRole,
                                                                    permissions: newRole.permissions.filter(p => p !== permission.id)
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium">{permission.name}</div>
                                                        <div className="text-xs text-muted-foreground">{permission.description}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Отмена
                                    </Button>
                                    <Button onClick={handleCreateRole}>
                                        Создать роль
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Роли в системе</CardTitle>
                            <CardDescription>
                                Управляйте ролями и их разрешениями
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Роль</TableHead>
                                        <TableHead>Пользователи</TableHead>
                                        <TableHead>Разрешения</TableHead>
                                        <TableHead>Тип</TableHead>
                                        <TableHead>Дата создания</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <Shield className="h-4 w-4" />
                                                        <span className="font-medium">{role.name}</span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {role.description}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span>{role.userCount}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {role.permissions.length} разрешений
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={role.isSystem ? "destructive" : "default"}>
                                                    {role.isSystem ? "Системная" : "Пользовательская"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{role.createdAt}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Матрица разрешений</CardTitle>
                            <CardDescription>
                                Настройте разрешения для каждой роли
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {Object.entries(groupedPermissions).map(([category, perms]) => (
                                <div key={category} className="mb-6">
                                    <h3 className="font-semibold mb-3 flex items-center">
                                        <Settings className="h-4 w-4 mr-2" />
                                        {category}
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Разрешение</TableHead>
                                                    {roles.map((role) => (
                                                        <TableHead key={role.id} className="text-center min-w-[100px]">
                                                            {role.name}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {perms.map((permission) => (
                                                    <TableRow key={permission.id}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{permission.name}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {permission.description}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        {roles.map((role) => (
                                                            <TableCell key={role.id} className="text-center">
                                                                <Switch
                                                                    checked={role.permissions.includes(permission.id)}
                                                                    onCheckedChange={() => handlePermissionToggle(role.id, permission.id)}
                                                                    disabled={role.isSystem}
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

    );
}