import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Truck, Package, MapPin, Calendar, Search, Plus, FileText } from "lucide-react";
import Header from "@/components/Header";
import { useShipments, Shipment } from '@/hooks/useShipments';
import { useNavigate } from 'react-router-dom';

const Shipments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const { items: shipments, deleteItem } = useShipments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "Доставлено":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_transit":
      case "В пути":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "planned":
      case "Подготовка":
      case "submitted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
      case "Отменено":
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

  const filteredShipments = shipments.filter(shipment =>
    shipment.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.from_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.to_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.goods_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.contract_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Поиск */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по статусу, адресу, товару..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Сетка отгрузок */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredShipments.map((shipment) => (
            <Card key={shipment.id} className="hover:shadow-md transition-shadow duration-200 h-fit">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg truncate" title={shipment.contract_number || shipment.id}>
                      {shipment.contract_number || `ID: ${shipment.id.slice(0, 8)}...`}
                    </CardTitle>
                    <CardDescription className="truncate" title={shipment.address}>
                      {shipment.address}
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
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(shipment.planned_date)}</span>
                  </div>
                  {shipment.loading_date && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{formatDate(shipment.loading_date)}</span>
                    </div>
                  )}
                </div>

                {/* Товар */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium truncate" title={shipment.goods_name}>
                      {shipment.goods_name || "Товар не указан"}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {shipment.goods_volume && (
                      <span>Объем: {shipment.goods_volume}</span>
                    )}
                    {shipment.goods_weight && (
                      <span>Вес: {shipment.goods_weight}</span>
                    )}
                    {shipment.goods_package && (
                      <span>Упаковка: {shipment.goods_package}</span>
                    )}
                  </div>
                </div>

                {/* Дополнительная информация */}
                <div className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded-md">
                  <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {shipment.request_code && (
                        <span className="truncate" title={shipment.request_code}>
                          Код: {shipment.request_code}
                        </span>
                      )}
                      {shipment.shop_name && (
                        <span className="truncate" title={shipment.shop_name}>
                          {shipment.shop_name}
                        </span>
                      )}
                    </div>
                  </div>
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
                    onClick={() => deleteItem(shipment.id)}
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
                  : "Попробуйте изменить поисковый запрос"
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