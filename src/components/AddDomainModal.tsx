import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useHostings, DomainFormData } from "@/hooks/useHostings";
import { Globe, X, Save, Calendar, Server } from "lucide-react";
import { Server as ServerInter } from "@/hooks/useHostings";

interface AddDomainModalProps {
  open: boolean;
  hostingId: string;
  serverId?: string;
  onOpenChange: (open: boolean) => void;
  onDomainAdded: (domain: any) => void;
}

export const AddDomainModal = ({
  open,
  onOpenChange,
  hostingId,
  serverId,
  onDomainAdded
}: AddDomainModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { createDomain, fetchAllServers } = useHostings();
  const [servers, setServers] = useState<ServerInter[]>([]);
  const [serversLoading, setServersLoading] = useState(true);

  // Загружаем список серверов при открытии модального окна
  useEffect(() => {
    if (serverId) {
      setFormData(prev => ({
        ...prev,
        server_id: serverId
      }));
    }
    const loadServers = async () => {
      if (open) {
        try {
          setServersLoading(true);
          const serversData = await fetchAllServers();
          setServers(serversData);
        } catch (error) {
          console.error("Error loading servers:", error);
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: "Не удалось загрузить список серверов",
          });
        } finally {
          setServersLoading(false);
        }
      }
    };

    loadServers();
  }, [open, fetchAllServers, toast, serverId]);

  const [formData, setFormData] = useState<DomainFormData>({
    name: "",
    status: "active",
    expiry_date: "",
    server_id: serverId || "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      status: "active",
      expiry_date: "",
      server_id: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: keyof DomainFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Вызываем API для создания домена
      const response = await createDomain(formData);

      // Вызываем колбэк с добавленным доменом
      onDomainAdded(response.data || response);

      toast({
        title: "Домен добавлен",
        description: "Домен успешно добавлен к серверу",
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating domain:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось добавить домен",
      });
    } finally {
      setLoading(false);
    }
  };

  // Вычисляем минимальную дату (сегодня)
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Валидация доменного имени
  const isValidDomain = (domain: string) => {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    return domainRegex.test(domain);
  };

  const isFormValid = formData.name && formData.expiry_date && isValidDomain(formData.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Добавить новый домен
          </DialogTitle>
          <DialogDescription>
            Заполните информацию о домене. Все поля обязательны для заполнения.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Имя домена */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Доменное имя <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="example.com"
              required
              className={formData.name && !isValidDomain(formData.name) ? "border-red-500" : ""}
            />
            {formData.name && !isValidDomain(formData.name) && (
              <p className="text-sm text-red-500">Введите корректное доменное имя</p>
            )}
            <p className="text-sm text-muted-foreground">
              Например: mysite.com или shop.mysite.com
            </p>
          </div>

          {/* Статус */}
          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'pending' | 'expired') =>
                handleSelectChange("status", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активен</SelectItem>
                <SelectItem value="pending">Ожидание</SelectItem>
                <SelectItem value="expired">Истек</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Выбор сервера */}
          <div className="space-y-2">
            <Label htmlFor="server">
              Сервер <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.server_id}
              onValueChange={(value) => handleSelectChange("server_id", value)}
              disabled={serversLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={serversLoading ? "Загрузка серверов..." : "Выберите сервер"} />
              </SelectTrigger>
              <SelectContent>
                {serversLoading ? (
                  <SelectItem value="loading" disabled>
                    Загрузка...
                  </SelectItem>
                ) : (
                  servers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        <span>{server.name}</span>
                        <span className="text-muted-foreground text-xs">({server.ip})</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {servers.length === 0 && !serversLoading && (
              <p className="text-sm text-muted-foreground">
                Нет доступных серверов
              </p>
            )}
          </div>

          {/* Дата истечения */}
          <div className="space-y-2">
            <Label htmlFor="expiry_date">
              Дата истечения <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="expiry_date"
                name="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={handleInputChange}
                min={getTodayDate()}
                className="pl-10"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Дата, когда истекает срок регистрации домена
            </p>
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
                  Добавление...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Добавить домен
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};