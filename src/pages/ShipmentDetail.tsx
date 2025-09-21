import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { ArrowLeft, FileText, Package, Calendar, MapPin, User, Edit, Trash2 } from "lucide-react";
import { useShipments } from '@/hooks/useShipments';
import { useToast } from "@/hooks/use-toast";

const ShipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items: shipments, loading, deleteItem, refetch } = useShipments();
  const { toast } = useToast();

  // Найти отгрузку по ID
  const shipment = shipments.find(s => s.id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Отгрузка не найдена</h1>
          <p className="text-muted-foreground mb-4">Отгрузка с ID {id} не существует</p>
          <Button onClick={() => navigate('/shipments')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к отгрузкам
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (shipment.status) {
      case 'draft':
        return 'secondary';
      case 'submitted':
        return 'default';
      case 'in_progress':
        return 'warning';
      case 'completed':
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" className="mb-4" onClick={() => navigate('/shipments')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к отгрузкам
          </Button>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-2xl font-bold">Отгрузка</h1>
                  <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
                </div>
                <p className="text-muted-foreground">ID: {shipment.id}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/shipments/edit/${shipment.id}`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const success = await deleteItem(shipment.id);
                  if (success) {
                    toast({
                      title: "Отгрузка удалена",
                      description: "Отгрузка успешно удалена",
                    });
                    navigate("/shipments");
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Детали отгрузки */}
            <Card>
              <CardHeader>
                <CardTitle>Информация об отгрузке</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {shipment.goods_name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Товар</label>
                    <p className="text-foreground">{shipment.goods_name}</p>
                  </div>
                )}
                {shipment.shop_name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Лавка</label>
                    <p className="text-foreground">{shipment.shop_name}</p>
                  </div>
                )}
                {shipment.address && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Адрес склада</label>
                    <p className="text-foreground">{shipment.address}</p>
                  </div>
                )}
                {shipment.loading_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Дата загрузки</label>
                    <p className="text-foreground">{shipment.loading_date}</p>
                  </div>
                )}
                {shipment.contract_number && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Номер договора</label>
                    <p className="text-foreground">{shipment.contract_number}</p>
                  </div>
                )}
                {shipment.additional_info && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Доп. информация</label>
                    <p className="text-foreground">{shipment.additional_info}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Создано</p>
                    <p className="text-muted-foreground">
                      {new Date(shipment.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {shipment.creator && (
                  <div className="flex items-center space-x-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Создатель</p>
                      <p className="text-muted-foreground">{shipment.creator.full_name}</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="text-sm">
                  <p className="font-medium mb-1">Статус</p>
                  <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Файлы */}
            <Card>
              <CardHeader>
                <CardTitle>Прикрепленные файлы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Файлы пока не загружены</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetail;
