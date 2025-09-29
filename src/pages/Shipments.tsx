import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Truck, Package, MapPin, Calendar, Search, Plus } from "lucide-react";
import Header from "@/components/Header";
import { useShipments, Shipment } from '@/hooks/useShipments';

const Shipments = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const mockShipments = [
    {
      id: 1,
      number: "ОТГ-2024-001",
      client: "ООО Торговый дом",
      destination: "Москва, ул. Тверская 15",
      status: "В пути",
      items: 15,
      weight: "2.5 т",
      date: "2024-01-15",
      driver: "Иванов И.И.",
      vehicle: "А123БВ199"
    },
    {
      id: 2,
      number: "ОТГ-2024-002",
      client: "ИП Петров",
      destination: "СПб, Невский пр. 45",
      status: "Доставлено",
      items: 8,
      weight: "1.2 т",
      date: "2024-01-14",
      driver: "Сидоров П.П.",
      vehicle: "В456ГД178"
    },
    {
      id: 3,
      number: "ОТГ-2024-003",
      client: "ЗАО Строй Инвест",
      destination: "Екатеринбург, ул. Ленина 30",
      status: "Подготовка",
      items: 25,
      weight: "4.8 т",
      date: "2024-01-16",
      driver: "Козлов А.В.",
      vehicle: "С789ЕЖ196"
    },
    {
      id: 4,
      number: "ОТГ-2024-004",
      client: "ООО Металл Сервис",
      destination: "Новосибирск, пр. Красный 12",
      status: "Отменено",
      items: 10,
      weight: "3.1 т",
      date: "2024-01-13",
      driver: "Морозов Д.С.",
      vehicle: "З012ИК154"
    }
  ];

  const {items: Shipments, deleteItem} = useShipments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Доставлено":
        return "bg-green-100 text-green-800";
      case "В пути":
        return "bg-blue-100 text-blue-800";
      case "Подготовка":
        return "bg-yellow-100 text-yellow-800";
      case "Отменено":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredShipments = Shipments.filter(shipment =>
    shipment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.from_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.to_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Отгрузки</h1>
            <p className="text-muted-foreground">Управление отгрузками и доставками</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Создать отгрузку
          </Button>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск отгрузок..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredShipments.map((shipment) => (
            <Card key={shipment.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{shipment.id}</CardTitle>
                    <CardDescription>{shipment.address}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(shipment.status)}>
                    {shipment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{shipment.to_location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{shipment.planned_date}</span>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{shipment.items} позиций</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Вес:</span>
                    <span>{shipment.goods_weight}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
                  <Truck className="h-4 w-4" />
                  <span>{shipment.request_code} • {shipment.shop_name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredShipments.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Отгрузки не найдены</h3>
              <p className="text-muted-foreground">Попробуйте изменить поисковый запрос</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>

  );
};

export default Shipments;