import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { 
  ArrowLeft, 
  FileText, 
  Package, 
  Calendar, 
  MapPin, 
  User, 
  Edit, 
  Trash2, 
  Truck,
  Building,
  Clock,
  Phone,
  Info,
  FileCheck,
  Weight,
  Box,
  Hash
} from "lucide-react";
import { useShipments } from '@/hooks/useShipments';
import { useToast } from "@/hooks/use-toast";

const ShipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items: shipments, loading, deleteItem } = useShipments();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('main');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Доставлено';
      case 'in_transit': return 'В пути';
      case 'planned': return 'Запланировано';
      case 'submitted': return 'На рассмотрении';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Не указана";
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Не указана";
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту отгрузку?')) {
      const success = await deleteItem(shipment.id);
      if (success) {
        toast({
          title: "Отгрузка удалена",
          description: "Отгрузка успешно удалена",
        });
        navigate("/shipments");
      }
    }
  };

  const InfoRow = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex items-start gap-3 py-2 ${className}`}>
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-muted-foreground mb-1">{label}</div>
        <div className="text-foreground">{value || "Не указано"}</div>
      </div>
    </div>
  );

  return (


      <div className="container mx-auto px-4 py-6">
        {/* Хлебные крошки и заголовок */}
        <div className="mb-6">
          <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/shipments')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к отгрузкам
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">
                    {shipment.contract_number || `Отгрузка ${shipment.external_id ? shipment.external_id.slice(0, 8) : shipment.id.slice(0, 8)}`}
                  </h1>
                  <Badge variant="outline" className={`${getStatusColor(shipment.status)} w-fit`}>
                    {getStatusText(shipment.status)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {shipment.goods_name || "Товар не указан"}
                  {shipment.shop_name && ` • ${shipment.shop_name}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/shipments/edit/${shipment.id}`)}
                className="flex-1 sm:flex-none"
              >
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить
              </Button>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Левая колонка - Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="main">Основное</TabsTrigger>
                <TabsTrigger value="goods">Товар</TabsTrigger>
                <TabsTrigger value="logistics">Логистика</TabsTrigger>
              </TabsList>

              {/* Вкладка Основное */}
              <TabsContent value="main" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Основная информация
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <InfoRow icon={Hash} label="Внешний ID" value={shipment.external_id} />
                      <InfoRow icon={FileCheck} label="Номер договора" value={shipment.contract_number} />
                    </div>
                    
                    <InfoRow icon={Building} label="Название лавки" value={shipment.shop_name} />
                    <InfoRow icon={MapPin} label="Адрес склада" value={shipment.address} />
                    <InfoRow icon={Hash} label="Код заявки" value={shipment.request_code} />
                    
                    <Separator />
                    
                    <InfoRow 
                      icon={Calendar} 
                      label="Дата создания" 
                      value={formatDateTime(shipment.created_at)} 
                    />
                    
                    {shipment.additional_info && (
                      <>
                        <Separator />
                        <InfoRow 
                          icon={FileText} 
                          label="Дополнительная информация" 
                          value={shipment.additional_info} 
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Вкладка Товар */}
              <TabsContent value="goods" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Информация о товаре
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InfoRow icon={Package} label="Наименование товара" value={shipment.goods_name} />
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <InfoRow icon={Weight} label="Вес товара" value={shipment.goods_weight} />
                      <InfoRow icon={Box} label="Объем товара" value={shipment.goods_volume} />
                      <InfoRow icon={Package} label="Тип упаковки" value={shipment.goods_package} />
                    </div>

                    {shipment.items && (
                      <>
                        <Separator />
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            Позиции товаров ({Array.isArray(shipment.items) ? shipment.items.length : 1})
                          </div>
                          {Array.isArray(shipment.items) ? (
                            <div className="space-y-2">
                              {shipment.items.map((item, index) => (
                                <div key={index} className="text-sm p-2 bg-muted/30 rounded">
                                  {JSON.stringify(item)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm p-2 bg-muted/30 rounded">
                              {shipment.items}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Вкладка Логистика */}
              <TabsContent value="logistics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Логистика
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <InfoRow icon={MapPin} label="Место отправления" value={shipment.from_location} />
                      <InfoRow icon={MapPin} label="Место назначения" value={shipment.to_location} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <InfoRow icon={Calendar} label="Плановая дата" value={formatDate(shipment.planned_date)} />
                      <InfoRow icon={Calendar} label="Фактическая дата" value={formatDate(shipment.actual_date)} />
                    </div>

                    <InfoRow icon={Calendar} label="Дата погрузки" value={formatDate(shipment.loading_date)} />
                    <InfoRow icon={Clock} label="График работы" value={shipment.work_schedule} />
                    
                    <InfoRow 
                      icon={Phone} 
                      label="Контакты погрузки" 
                      value={shipment.loading_contacts} 
                    />
                    
                    <InfoRow 
                      icon={FileText} 
                      label="Требования к погрузке" 
                      value={shipment.loading_requirements} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Правая колонка - Дополнительная информация */}
          <div className="space-y-6">
            {/* Статус и метаданные */}
            <Card>
              <CardHeader>
                <CardTitle>Статус отгрузки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Badge variant="outline" className={`${getStatusColor(shipment.status)} w-fit mx-auto text-base py-1.5`}>
                    {getStatusText(shipment.status)}
                  </Badge>
                </div>
                
                <Separator />
                
                <InfoRow icon={User} label="Создатель" value={shipment.creator?.full_name || "Не указан"} />
                <InfoRow icon={Calendar} label="Создано" value={formatDateTime(shipment.created_at)} />
                <InfoRow icon={Calendar} label="Обновлено" value={formatDateTime(shipment.updated_at)} />
              </CardContent>
            </Card>

            {/* Файлы */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Прикрепленные файлы
                </CardTitle>
                <CardDescription>
                  {shipment.files?.length || 0} файлов
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shipment.files && shipment.files.length > 0 ? (
                  <div className="space-y-2">
                    {shipment.files.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg border">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{file.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Скачать
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Файлы не загружены</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Быстрые действия */}
            <Card>
              <CardHeader>
                <CardTitle>Действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Скачать PDF
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Изменить статус
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Truck className="w-4 h-4 mr-2" />
                  Отследить доставку
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default ShipmentDetail;