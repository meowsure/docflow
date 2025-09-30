import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Truck, 
  Package, 
  MapPin, 
  Calendar, 
  Search, 
  Plus, 
  FileText,
  Building,
  Clock,
  Filter
} from "lucide-react";
import Header from "@/components/Header";
import { useShipments, Shipment } from '@/hooks/useShipments';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const Shipments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { items: shipments, deleteItem } = useShipments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_transit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "planned":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "submitted":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered": return "Доставлено";
      case "in_transit": return "В пути";
      case "planned": return "Запланировано";
      case "submitted": return "На рассмотрении";
      case "cancelled": return "Отменено";
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Не указана";
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatItemsCount = (items: any) => {
    if (!items) return "0 позиций";
    if (Array.isArray(items)) return `${items.length} позиций`;
    return "1 позиция";
  };

  // Фильтрация отгрузок
  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      shipment.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.from_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.to_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.goods_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.contract_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.request_code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (shipmentId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту отгрузку?')) {
      const success = await deleteItem(shipmentId);
      if (success) {
        toast({
          title: "Отгрузка удалена",
          description: "Отгрузка успешно удалена",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Заголовок и кнопка */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Отгрузки</h1>
            <p className="text-muted-foreground mt-1">Управление отгрузками и доставками</p>
          </div>
          <Button onClick={() => navigate('/shipments/create')} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Создать отгрузку
          </Button>
        </div>

        {/* Фильтры */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по статусу, адресу, товару, магазину..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="planned">Запланированные</SelectItem>
                  <SelectItem value="submitted">На рассмотрении</SelectItem>
                  <SelectItem value="in_transit">В пути</SelectItem>
                  <SelectItem value="delivered">Доставленные</SelectItem>
                  <SelectItem value="cancelled">Отмененные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Статистика по статусам */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className="text-center p-2 bg-muted/30 rounded-lg">
            <div className="font-semibold">Все</div>
            <div className="text-muted-foreground">{shipments.length}</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded-lg">
            <div className="font-semibold">Запланированные</div>
            <div className="text-muted-foreground">
              {shipments.filter(s => s.status === 'planned').length}
            </div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded-lg">
            <div className="font-semibold">На рассмотрении</div>
            <div className="text-muted-foreground">
              {shipments.filter(s => s.status === 'submitted').length}
            </div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="font-semibold">В пути</div>
            <div className="text-muted-foreground">
              {shipments.filter(s => s.status === 'in_transit').length}
            </div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="font-semibold">Доставленные</div>
            <div className="text-muted-foreground">
              {shipments.filter(s => s.status === 'delivered').length}
            </div>
          </div>
        </div>

        {/* Сетка отгрузок */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredShipments.map((shipment) => (
            <Card key={shipment.id} className="hover:shadow-md transition-shadow duration-200 h-fit">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg truncate" title={shipment.contract_number || `Отгрузка ${shipment.external_id ? shipment.external_id.slice(0, 8) : shipment.id.slice(0, 8)}`}>
                      {shipment.contract_number || `Отгрузка ${shipment.external_id ? shipment.external_id.slice(0, 8) : shipment.id.slice(0, 8)}`}
                    </CardTitle>
                    <CardDescription className="truncate" title={shipment.address}>
                      {shipment.address || "Адрес не указан"}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={`${getStatusColor(shipment.status)} whitespace-nowrap`}>
                    {getStatusText(shipment.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Маршрут */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-xs text-muted-foreground">Из:</span>
                        <span className="truncate" title={shipment.from_location}>
                          {shipment.from_location || "Не указано"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="font-medium text-xs text-muted-foreground">В:</span>
                        <span className="truncate" title={shipment.to_location}>
                          {shipment.to_location || "Не указано"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Даты */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground" title="Плановая дата">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">{formatDate(shipment.planned_date)}</span>
                  </div>
                  {shipment.loading_date && (
                    <div className="flex items-center gap-2 text-muted-foreground" title="Дата погрузки">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">{formatDate(shipment.loading_date)}</span>
                    </div>
                  )}
                  {shipment.actual_date && (
                    <div className="flex items-center gap-2 text-muted-foreground" title="Фактическая дата">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">{formatDate(shipment.actual_date)}</span>
                    </div>
                  )}
                </div>

                {/* Товар и магазин */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium truncate" title={shipment.goods_name}>
                      {shipment.goods_name || "Товар не указан"}
                    </span>
                  </div>
                  
                  {shipment.shop_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate" title={shipment.shop_name}>
                        {shipment.shop_name}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {shipment.goods_volume && (
                      <span title="Объем товара">📦 {shipment.goods_volume}</span>
                    )}
                    {shipment.goods_weight && (
                      <span title="Вес товара">⚖️ {shipment.goods_weight}</span>
                    )}
                    {shipment.goods_package && (
                      <span title="Тип упаковки">📋 {shipment.goods_package}</span>
                    )}
                  </div>
                </div>

                {/* Дополнительная информация */}
                <div className="space-y-2">
                  {shipment.request_code && (
                    <div className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded-md">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate" title={shipment.request_code}>
                        Код заявки: {shipment.request_code}
                      </span>
                    </div>
                  )}

                  {shipment.work_schedule && (
                    <div className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded-md">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate" title={shipment.work_schedule}>
                        График: {shipment.work_schedule}
                      </span>
                    </div>
                  )}
                </div>

                {/* Позиции товаров */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>🔄 {formatItemsCount(shipment.items)}</span>
                </div>

                {/* Кнопки действий */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/shipments/${shipment.id}`)}
                  >
                    Подробнее
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(shipment.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Состояние пустого списка */}
        {filteredShipments.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {shipments.length === 0 ? "Нет отгрузок" : "Отгрузки не найдены"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {shipments.length === 0 
                  ? "Создайте первую отгрузку" 
                  : "Попробуйте изменить параметры фильтрации"
                }
              </p>
              {shipments.length === 0 && (
                <Button onClick={() => navigate('/shipments/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать отгрузку
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Shipments;