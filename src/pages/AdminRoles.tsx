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
import { Plus, Shield, Users, Settings, Trash } from "lucide-react";
import Header from "@/components/Header";
import { useRoles } from "@/hooks/useRoles";
import { useToast } from "@/hooks/use-toast";
import api from "@/api";

interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
}

const mockPermissions: Permission[] = [
    { id: "1", name: "Просмотр пользователей", description: "Возможность просматривать список пользователей", category: "Пользователи" },
    { id: "2", name: "Редактирование пользователей", description: "Возможность редактировать данные пользователей", category: "Пользователи" },
    { id: "3", name: "Удаление пользователей", description: "Возможность удалять пользователей", category: "Пользователи" },
    { id: "4", name: "Редактирование задач", description: "Возможность редактировать существующие задачи", category: "Задачи" },
    { id: "5", name: "Удаление задач", description: "Возможность удалять задачи", category: "Задачи" },
    { id: "6", name: "Создание отгрузок", description: "Возможность создавать отгрузки", category: "Логистика" },
    { id: "7", name: "Просмотр отгрузок", description: "Возможность просматривать все отгрузки", category: "Логистика" },
    { id: "8", name: "Управление отгрузками", description: "Полный доступ к модулю отгрузок", category: "Логистика" },
    { id: "9", name: "Просмотр финансов", description: "Доступ к финансовой отчетности", category: "Финансы" },
    { id: "10", name: "Создание счета", description: "Возможность создавать счет на оплату", category: "Финансы" },
    { id: "11", name: "Удаление счета", description: "Возможность удалять счет на оплату", category: "Финансы" },
    { id: "12", name: "Редактирование счетов", description: "Возможность редактировать счета и платежи", category: "Финансы" },
    { id: "13", name: "Просмотр логов", description: "Доступ к системным логам", category: "Система" },
    { id: "14", name: "Администратор", description: "Доступ администратора", category: "Система" },
    { id: "15", name: "Создавать задачу", description: "Возможность создавать задачу", category: "Документооборот" },
    { id: "16", name: "Загрузка файлов", description: "Возможность загружать файлы", category: "Файлы" },
    { id: "17", name: "Просмотр файлов", description: "Возможность просматривать файлы", category: "Файлы" },
    { id: "18", name: "Удаление файлов", description: "Возможность удалять файлы", category: "Файлы" },
];

export default function AdminRoles() {
    const { items: roles, createItem, updateItem, deleteItem, refetch } = useRoles();
    const [permissions] = useState<Permission[]>(mockPermissions);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState({
        name: "",
        permissions: [] as string[],
    });
    const { toast } = useToast();

    const handlePermissionToggle = async (roleId: string, permissionId: string) => {
        const role = roles.find(r => r.id === roleId);
        if (!role || role.isSystem) return;

        const newPermissions = role.permissions.includes(permissionId)
            ? role.permissions.filter(p => p !== permissionId)
            : [...role.permissions, permissionId];

        const res = await api.put(`roles/${roleId}/permissions`, { permissions: newPermissions });
        toast({
            variant: "default",
            title: "Изменения сохранены",
            description: res.data,
        });
        refetch();

        // await updateItem(roleId, { permissions: newPermissions });
    };

    const handleCreateRole = async () => {
        const role = await createItem({
            name: newRole.name,
            permissions: newRole.permissions,
        });

        if (role) {
            setNewRole({ name: "", permissions: [] });
            setIsCreateDialogOpen(false);
        }
    };

    const handleDeleteRole = async (roleId: string) => {
        const confirmed = confirm("Вы уверены, что хотите удалить эту роль?");
        if (!confirmed) return;

        await deleteItem(roleId);
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
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                            <DialogHeader className="pb-4">
                                <DialogTitle>Создание новой роли</DialogTitle>
                                <DialogDescription>
                                    Создайте новую роль и назначьте необходимые разрешения
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex-1 overflow-hidden flex flex-col gap-4">
                                <div>
                                    <Label htmlFor="role-name">Название роли</Label>
                                    <Input
                                        id="role-name"
                                        value={newRole.name}
                                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                        placeholder="Введите название роли"
                                    />
                                </div>

                                <div className="flex-1 overflow-hidden flex flex-col">
                                    <Label className="mb-2">Разрешения</Label>
                                    <div className="border rounded-md flex-1 overflow-hidden">
                                        <div className="h-[300px] overflow-auto">
                                            <div className="p-4">
                                                {Object.entries(groupedPermissions).map(([category, perms]) => (
                                                    <div key={category} className="mb-6 last:mb-0">
                                                        <h4 className="font-medium text-sm mb-3 sticky top-0 bg-background py-1">
                                                            {category}
                                                        </h4>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {perms.map((permission) => (
                                                                <div key={permission.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
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
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-sm font-medium truncate">{permission.name}</div>
                                                                        <div className="text-xs text-muted-foreground line-clamp-2">{permission.description}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t">
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
                                        <TableHead className="w-[100px]">Действия</TableHead>
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
                                                        {role.description ? role.description : "Нет описания"}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span>{role.users_count ? role.users_count : 0}</span>
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
                                            <TableCell>{role.created_at}</TableCell>
                                            <TableCell>{/* Кнопка удаления показывается только для несистемных ролей */}
                                                {!role.isSystem && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteRole(role.id)}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                )}</TableCell>
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