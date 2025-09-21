import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, MapPin, Eye, Truck, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Shipment } from "@/hooks/useShipments";

interface ShipmentCardProps {
  shipment: Shipment;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const ShipmentCard = ({ shipment, onDelete, isDeleting }: ShipmentCardProps) => {
  // Расширяем интерфейс Shipment для доступа к дополнительным полям
  const extendedShipment = shipment as any;

  const getStatusColor = () => {
    switch (shipment.status) {
      case 'draft':
        return 'secondary';
      case 'submitted':
        return 'warning';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'success';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (shipment.status) {
      case 'draft':
        return 'Черновик';
      case 'submitted':
        return 'Отправлено';
      case 'in_progress':
        return 'В работе';
      case 'completed':
        return 'Выполнено';
      case 'confirmed':
        return 'Подтверждено';
      case 'cancelled':
        return 'Отменено';
      default:
        return shipment.status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Отгрузка</h3>
              {extendedShipment.external_id && (
                <p className="text-xs text-muted-foreground">ID: {extendedShipment.external_id}</p>
              )}
            </div>
          </div>
          <Badge variant={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-foreground mb-3 line-clamp-2">
          {extendedShipment.goods_name
            ? `Товар: ${extendedShipment.goods_name}`
            : `Отгрузка (ID: ${shipment.id.slice(0, 8)})`}
        </p>

        {extendedShipment.shop_name && (
          <div className="flex items-center space-x-1">
            <Package className="w-3 h-3" />
            <span>{extendedShipment.shop_name}</span>
          </div>
        )}

        {extendedShipment.address && (
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>{extendedShipment.address}</span>
          </div>
        )}

        <div className="space-y-2 text-xs text-muted-foreground">
          {extendedShipment.from_location && extendedShipment.to_location && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{extendedShipment.from_location} → {extendedShipment.to_location}</span>
            </div>
          )}

          {extendedShipment.planned_date && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>План: {formatDate(extendedShipment.planned_date)}</span>
            </div>
          )}

          {extendedShipment.actual_date && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Факт: {formatDate(extendedShipment.actual_date)}</span>
            </div>
          )}

          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Создана: {formatDate(shipment.created_at)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex justify-between gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/shipments/${shipment.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            Подробнее
          </Link>
        </Button>

        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="w-20"
          >
            {isDeleting ? "..." : "Удалить"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ShipmentCard;