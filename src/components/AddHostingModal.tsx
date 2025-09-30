// components/AddHostingModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useHostings } from "@/hooks/useHostings";
import { Server, X, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AddHostingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface ServerFormData {
    name: string;
    ip: string;
    status: 'online' | 'offline' | 'maintenance';
    cpu: string;
    ram: string;
    storage: string;
    os: string;
    login?: string; // добавьте это поле, т.к. оно используется в addServer
    password?: string; // добавьте это поле
}

export const AddHostingModal = ({ open, onOpenChange }: AddHostingModalProps) => {
    const { toast } = useToast();
    const { createHosting } = useHostings();
    const [loading, setLoading] = useState(false);
    const [servers, setServers] = useState<ServerFormData[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        provider: "",
        plan: "",
        status: "active" as "active" | "suspended" | "pending",
        ip: "",
        login_url: "",
        username: "",
        password: "",
        expiry_date: "",
    });

    const resetForm = () => {
        setFormData({
            name: "",
            provider: "",
            plan: "",
            status: "active",
            ip: "",
            login_url: "",
            username: "",
            password: "",
            expiry_date: "",
        });
        setServers([]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addServer = () => {
        setServers(prev => [...prev, {
            name: "",
            ip: "",
            status: "online",
            cpu: "",
            ram: "",
            login: "root",
            password: "",
            storage: "",
            os: "",
        }]);
    };

    const removeServer = (index: number) => {
        setServers(prev => prev.filter((_, i) => i !== index));
    };

    const updateServer = (index: number, field: keyof ServerFormData, value: string) => {
        setServers(prev => prev.map((server, i) =>
            i === index ? { ...server, [field]: value } : server
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) {
            toast({
                title: "Заполните обязательные поля",
                description: "Пожалуйста, заполните все обязательные поля, отмеченные *",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const hostingData = {
                ...formData,
                servers: servers.filter(server => server.name && server.ip),
            };

            await createHosting(hostingData);

            toast({
                title: "Хостинг создан",
                description: "Хостинг успешно добавлен в систему",
            });
            resetForm();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error creating hosting:", error);

            let errorMessage = "Неизвестная ошибка";
            if (error?.message) {
                errorMessage = error.message;
            } else if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            toast({
                title: "Хостинг не удалось создать",
                description: `При создании хостинга произошла ошибка: ${errorMessage}`,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = formData.name && formData.provider && formData.plan && formData.expiry_date;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Server className="w-5 h-5" />
                        Добавить новый хостинг
                    </DialogTitle>
                    <DialogDescription>
                        Заполните информацию о хостинге. Поля отмеченные * обязательны для заполнения.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Основная информация */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Основная информация</h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Название хостинга <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Например: Основной хостинг"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="provider">
                                    Провайдер <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="provider"
                                    name="provider"
                                    value={formData.provider}
                                    onChange={handleInputChange}
                                    placeholder="Например: TimeWeb, Reg.ru"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="plan">
                                    Тарифный план <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="plan"
                                    name="plan"
                                    value={formData.plan}
                                    onChange={handleInputChange}
                                    placeholder="Например: Бизнес, Старт"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Статус</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: "active" | "suspended" | "pending") =>
                                        handleSelectChange("status", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Активен</SelectItem>
                                        <SelectItem value="suspended">Приостановлен</SelectItem>
                                        <SelectItem value="pending">Ожидание</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ip">IP адрес</Label>
                            <Input
                                id="ip"
                                name="ip"
                                value={formData.ip}
                                onChange={handleInputChange}
                                placeholder="192.168.1.100"
                            />
                        </div>
                    </div>

                    {/* Данные для подключения */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Данные для подключения</h3>

                        <div className="space-y-2">
                            <Label htmlFor="login_url">URL для входа в панель управления</Label>
                            <Input
                                id="login_url"
                                name="login_url"
                                type="url"
                                value={formData.login_url}
                                onChange={handleInputChange}
                                placeholder="https://panel.hosting.com"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Имя пользователя</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="admin"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Пароль</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Срок действия */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Срок действия</h3>

                        <div className="space-y-2">
                            <Label htmlFor="expiry_date">
                                Дата истечения <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="expiry_date"
                                name="expiry_date"
                                type="date"
                                value={formData.expiry_date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Серверы */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Серверы</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addServer}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Добавить сервер
                            </Button>
                        </div>

                        {servers.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                                <Server className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">Серверы не добавлены</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Вы можете добавить серверы позже
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {servers.map((server, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">Сервер {index + 1}</Badge>
                                                {server.name && (
                                                    <span className="text-sm font-medium">{server.name}</span>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeServer(index)}
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`server-name-${index}`}>
                                                    Название сервера
                                                </Label>
                                                <Input
                                                    id={`server-name-${index}`}
                                                    value={server.name}
                                                    onChange={(e) => updateServer(index, 'name', e.target.value)}
                                                    placeholder="Web Server 01"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`server-ip-${index}`}>
                                                    IP адрес
                                                </Label>
                                                <Input
                                                    id={`server-ip-${index}`}
                                                    value={server.ip}
                                                    onChange={(e) => updateServer(index, 'ip', e.target.value)}
                                                    placeholder="192.168.1.101"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`server-username-${index}`}>
                                                    Логин
                                                </Label>
                                                <Input
                                                    id={`server-username-${index}`}
                                                    value={server.login}
                                                    onChange={(e) => updateServer(index, 'login', e.target.value)}
                                                    placeholder="root"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`server-password-${index}`}>
                                                    Пароль
                                                </Label>
                                                <Input
                                                    id={`server-password-${index}`}
                                                    value={server.password}
                                                    onChange={(e) => updateServer(index, 'password', e.target.value)}
                                                    placeholder="***************"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`server-status-${index}`}>Статус</Label>
                                                <Select
                                                    value={server.status}
                                                    onValueChange={(value: 'online' | 'offline' | 'maintenance') =>
                                                        updateServer(index, 'status', value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="online">Online</SelectItem>
                                                        <SelectItem value="offline">Offline</SelectItem>
                                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`server-os-${index}`}>ОС</Label>
                                                <Input
                                                    id={`server-os-${index}`}
                                                    value={server.os}
                                                    onChange={(e) => updateServer(index, 'os', e.target.value)}
                                                    placeholder="Ubuntu 20.04"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`server-cpu-${index}`}>CPU</Label>
                                                <Input
                                                    id={`server-cpu-${index}`}
                                                    value={server.cpu}
                                                    onChange={(e) => updateServer(index, 'cpu', e.target.value)}
                                                    placeholder="4 ядра"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`server-ram-${index}`}>RAM</Label>
                                                <Input
                                                    id={`server-ram-${index}`}
                                                    value={server.ram}
                                                    onChange={(e) => updateServer(index, 'ram', e.target.value)}
                                                    placeholder="8GB"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`server-storage-${index}`}>Хранилище</Label>
                                                <Input
                                                    id={`server-storage-${index}`}
                                                    value={server.storage}
                                                    onChange={(e) => updateServer(index, 'storage', e.target.value)}
                                                    placeholder="500GB SSD"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Отмена
                        </Button>
                        <Button type="submit" disabled={!isFormValid || loading}>
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Создание...
                                </>
                            ) : (
                                <>
                                    <Server className="w-4 h-4 mr-2" />
                                    Создать хостинг
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};