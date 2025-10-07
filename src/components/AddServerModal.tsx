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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Server, X, Save, Server as ServerIcon } from "lucide-react";
import { useHostings } from "@/hooks/useHostings";

interface AddServerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hostingId: string;
  onServerAdded: (server: Server) => void;
}

interface ServerFormData {
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'maintenance';
  cpu: string;
  ram: string;
  storage: string;
  os: string;
}

export const AddServerModal = ({ 
  open, 
  onOpenChange, 
  hostingId, 
  onServerAdded 
}: AddServerModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<ServerFormData>({
    name: "",
    ip: "",
    status: "online",
    cpu: "",
    ram: "",
    storage: "",
    os: "",
  });

  // Предопределенные варианты для выпадающих списков
  const osOptions = [
    "Ubuntu 20.04",
    "Ubuntu 22.04", 
    "CentOS 7",
    "CentOS 8",
    "CentOS 9",
    "Debian 11",
    "Debian 12",
    "Windows Server 2019",
    "Windows Server 2022",
    "AlmaLinux 8",
    "AlmaLinux 9",
    "Rocky Linux 8",
    "Rocky Linux 9"
  ];

  const cpuOptions = [
    "1 ядро",
    "2 ядра", 
    "4 ядра",
    "6 ядер",
    "8 ядер",
    "12 ядер",
    "16 ядер",
    "24 ядра",
    "32 ядра"
  ];

  const ramOptions = [
    "1GB",
    "2GB",
    "4GB", 
    "8GB",
    "16GB",
    "32GB",
    "64GB",
    "128GB",
    "256GB"
  ];

  const storageOptions = [
    "20GB SSD",
    "40GB SSD",
    "80GB SSD",
    "160GB SSD",
    "320GB SSD",
    "500GB SSD",
    "1TB SSD",
    "2TB SSD",
    "500GB HDD", 
    "1TB HDD",
    "2TB HDD",
    "4TB HDD"
  ];

  const resetForm = () => {
    setFormData({
      name: "",
      ip: "",
      status: "online",
      cpu: "",
      ram: "",
      storage: "",
      os: "",
    });
  };

  const { addServer } = useHostings();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: keyof ServerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Импортируем хук useHostings
      
      // Вызываем метод добавления сервера
      const newServer = await addServer(hostingId, formData);
      
      // Вызываем колбэк с добавленным сервером
      onServerAdded(newServer);
      
      toast({
        title: "Сервер добавлен",
        description: "Сервер успешно добавлен к хостингу",
      });
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      // Ошибка уже обработана в хуке useHostings
      console.error("Error creating server:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.ip;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ServerIcon className="w-5 h-5" />
            Добавить новый сервер
          </DialogTitle>
          <DialogDescription>
            Заполните информацию о сервере. Поля отмеченные * обязательны для заполнения.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Основная информация</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Название сервера <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Например: Web Server 01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip">
                  IP адрес <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ip"
                  name="ip"
                  value={formData.ip}
                  onChange={handleInputChange}
                  placeholder="192.168.1.100"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'online' | 'offline' | 'maintenance') => 
                    handleSelectChange("status", value)
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
                <Label htmlFor="os">Операционная система</Label>
                <Select
                  value={formData.os}
                  onValueChange={(value) => handleSelectChange("os", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите ОС" />
                  </SelectTrigger>
                  <SelectContent>
                    {osOptions.map((os) => (
                      <SelectItem key={os} value={os}>
                        {os}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Характеристики сервера */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Характеристики сервера</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpu">Процессор (CPU)</Label>
                <Select
                  value={formData.cpu}
                  onValueChange={(value) => handleSelectChange("cpu", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите CPU" />
                  </SelectTrigger>
                  <SelectContent>
                    {cpuOptions.map((cpu) => (
                      <SelectItem key={cpu} value={cpu}>
                        {cpu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ram">Оперативная память (RAM)</Label>
                <Select
                  value={formData.ram}
                  onValueChange={(value) => handleSelectChange("ram", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите RAM" />
                  </SelectTrigger>
                  <SelectContent>
                    {ramOptions.map((ram) => (
                      <SelectItem key={ram} value={ram}>
                        {ram}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage">Хранилище</Label>
                <Select
                  value={formData.storage}
                  onValueChange={(value) => handleSelectChange("storage", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите хранилище" />
                  </SelectTrigger>
                  <SelectContent>
                    {storageOptions.map((storage) => (
                      <SelectItem key={storage} value={storage}>
                        {storage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                  Добавить сервер
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};