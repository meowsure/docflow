import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileUploader from '@/components/FileUploader'; // Исправлен импорт
import { UploadedFile } from '@/components/FileUploader';
import Header from "@/components/Header";
import { ArrowLeft, Package, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useShipments } from '@/hooks/useShipments';
import { useFiles } from "@/hooks/useFiles";

const CreateShipment = () => {
  const { toast } = useToast();
  const { createItem } = useShipments();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { uploadFilesWithProgress } = useFiles();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { uploadFile } = useFiles();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Основные поля
    externalId: '',
    status: 'planned',
    fromLocation: '',
    toLocation: '',
    plannedDate: '',
    actualDate: '',
    items: [],

    // Новые поля
    address: '',
    workSchedule: '',
    requestCode: '',
    loadingContacts: '',
    shopName: '',
    goodsName: '',
    goodsVolume: '',
    goodsWeight: '',
    goodsPackage: '',
    contractNumber: '',
    loadingDate: '',
    loadingRequirements: '',
    additionalInfo: ''
  });

  // Обработчики изменений
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

  // Преобразование в данные для отправки на бэкенд
  const prepareSubmitData = () => {
    return {
      external_id: formData.externalId,
      status: formData.status,
      from_location: formData.fromLocation,
      to_location: formData.toLocation,
      planned_date: formData.plannedDate || null,
      actual_date: formData.actualDate || null,
      items: formData.items,
      address: formData.address,
      work_schedule: formData.workSchedule,
      request_code: formData.requestCode,
      loading_contacts: formData.loadingContacts,
      shop_name: formData.shopName,
      goods_name: formData.goodsName,
      goods_volume: formData.goodsVolume,
      goods_weight: formData.goodsWeight,
      goods_package: formData.goodsPackage,
      contract_number: formData.contractNumber,
      loading_date: formData.loadingDate || null,
      loading_requirements: formData.loadingRequirements,
      additional_info: formData.additionalInfo,
      created_by: user?.id || ""
    };
  };

  const handleSubmit = async () => {
    if (!formData.address || !formData.goodsName || !formData.contractNumber) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните обязательные поля: адрес, название товара и номер договора"
      });
      return;
    }

    try {
      setLoading(true);

      // Загрузка файлов, если они есть
      const uploadedIds: string[] = [];
      if (files.length > 0) {
        for (const f of files) {
          const uploaded = await uploadFile(f.file);
          if (uploaded) uploadedIds.push(uploaded.id);
        }
      }

      const submitData = prepareSubmitData();

      const shipment = await createItem({
        ...submitData
      });

      if (shipment && shipment.id) {
        if (files.length > 0) {
          const { successes, errors } = await uploadFilesWithProgress(
            files,
            'App\\Models\\Task', // entity_type для Laravel
            task.id, // entity_id - ID созданной задачи
            // Колбэк для обновления статуса каждого файла
            (fileId, status, serverId) => {
              setFiles(prevFiles =>
                prevFiles.map(file =>
                  file.id === fileId
                    ? { ...file, status, ...(serverId && { serverId }) }
                    : file
                )
              );
            }
          );

          if (errors.length > 0) {
            toast({
              variant: "destructive",
              title: "Частичная ошибка",
              description: `Задача создана, но ${errors.length} из ${files.length} файлов не загружены`
            });
          } else {
            toast({
              title: "Успех!",
              description: `Отгрузка и ${successes.length} файлов успешно созданы`
            });
          }
        } else {
          toast({
          title: "Отгрузка создана",
          description: "Отгрузка успешно создана"
        });
        }
        toast({
          title: "Отгрузка создана",
          description: "Отгрузка успешно создана"
        });
        navigate('/shipments');
      }
    } catch (error) {
      console.error("Create shipment error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать отгрузку"
      });
    } finally {
      setLoading(false);
    }
  };

  // Проверка заполненности обязательных полей
  const requiredFieldsFilled = formData.address && formData.goodsName && formData.contractNumber;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" className="mb-4" onClick={() => navigate('/shipments')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к отгрузкам
          </Button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Создать отгрузку</h1>
              <p className="text-muted-foreground">Заполните данные для новой отгрузки</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📦</span>
                  <span>Основная информация</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="externalId">Внешний ID</Label>
                    <Input
                      id="externalId"
                      name="externalId"
                      value={formData.externalId}
                      onChange={handleInputChange}
                      placeholder="Внешний идентификатор"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Статус</Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Запланирована</SelectItem>
                        <SelectItem value="in_transit">В пути</SelectItem>
                        <SelectItem value="delivered">Доставлена</SelectItem>
                        <SelectItem value="cancelled">Отменена</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromLocation">Место отправления</Label>
                    <Input
                      id="fromLocation"
                      name="fromLocation"
                      value={formData.fromLocation}
                      onChange={handleInputChange}
                      placeholder="Откуда"
                    />
                  </div>

                  <div>
                    <Label htmlFor="toLocation">Место назначения</Label>
                    <Input
                      id="toLocation"
                      name="toLocation"
                      value={formData.toLocation}
                      onChange={handleInputChange}
                      placeholder="Куда"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plannedDate">Плановая дата</Label>
                    <Input
                      id="plannedDate"
                      name="plannedDate"
                      type="date"
                      value={formData.plannedDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="actualDate">Фактическая дата</Label>
                    <Input
                      id="actualDate"
                      name="actualDate"
                      type="date"
                      value={formData.actualDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Документы */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📋</span>
                  <span>Документы</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Загрузите спецификацию и договор (необязательно)
                </p>
                <FileUploader onFilesChange={setFiles} maxFiles={10} />
              </CardContent>
            </Card>

            {/* Информация о складе */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🏭</span>
                  <span>Информация о складе</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Полный адрес склада *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Введите полный адрес склада..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="workSchedule">Время работы склада</Label>
                  <Input
                    id="workSchedule"
                    name="workSchedule"
                    value={formData.workSchedule}
                    onChange={handleInputChange}
                    placeholder="Пн-Пт 9:00-18:00"
                  />
                </div>

                <div>
                  <Label htmlFor="requestCode">Код заявки для склада</Label>
                  <Input
                    id="requestCode"
                    name="requestCode"
                    value={formData.requestCode}
                    onChange={handleInputChange}
                    placeholder="Введите код заявки или 'нет'"
                  />
                </div>

                <div>
                  <Label htmlFor="loadingContacts">Контакты ответственных лиц на загрузке</Label>
                  <Textarea
                    id="loadingContacts"
                    name="loadingContacts"
                    value={formData.loadingContacts}
                    onChange={handleInputChange}
                    placeholder="ФИО, должность, телефон..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Информация о лавке и товаре */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🏪</span>
                  <span>Информация о лавке и товаре</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shopName">Название лавки</Label>
                  <Input
                    id="shopName"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    placeholder="От какой лавки подписались?"
                  />
                </div>

                <div>
                  <Label htmlFor="goodsName">Наименование товара *</Label>
                  <Input
                    id="goodsName"
                    name="goodsName"
                    value={formData.goodsName}
                    onChange={handleInputChange}
                    placeholder="Укажите наименование товара..."
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goodsVolume">Объем товара</Label>
                    <Input
                      id="goodsVolume"
                      name="goodsVolume"
                      value={formData.goodsVolume}
                      onChange={handleInputChange}
                      placeholder="Кол-во единиц, метры, штуки..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="goodsWeight">Вес товара</Label>
                    <Input
                      id="goodsWeight"
                      name="goodsWeight"
                      value={formData.goodsWeight}
                      onChange={handleInputChange}
                      placeholder="Укажите вес..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="goodsPackage">Тип упаковки</Label>
                  <Input
                    id="goodsPackage"
                    name="goodsPackage"
                    value={formData.goodsPackage}
                    onChange={handleInputChange}
                    placeholder="Паллеты, коробки, бухты..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Дополнительная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📋</span>
                  <span>Дополнительная информация</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contractNumber">Номер договора *</Label>
                  <Input
                    id="contractNumber"
                    name="contractNumber"
                    value={formData.contractNumber}
                    onChange={handleInputChange}
                    placeholder="Укажите номер договора..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="loadingDate">Дата загрузки</Label>
                  <Input
                    id="loadingDate"
                    name="loadingDate"
                    type="date"
                    value={formData.loadingDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="loadingRequirements">Особые требования к загрузке</Label>
                  <Textarea
                    id="loadingRequirements"
                    name="loadingRequirements"
                    value={formData.loadingRequirements}
                    onChange={handleInputChange}
                    placeholder="Укажите особые требования или 'нет'"
                  />
                </div>

                <div>
                  <Label htmlFor="additionalInfo">Дополнительная информация</Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Любая другая важная информация..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Сводка */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Сводка</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Тип задачи:</span>
                    <span className="font-medium">Отгрузка</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Файлов загружено:</span>
                    <span className="font-medium">{files.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Статус:</span>
                    <span className="font-medium capitalize">
                      {formData.status === 'planned' && 'Запланирована'}
                      {formData.status === 'in_transit' && 'В пути'}
                      {formData.status === 'delivered' && 'Доставлена'}
                      {formData.status === 'cancelled' && 'Отменена'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Обязательные поля:</span>
                    <span className={`font-medium ${requiredFieldsFilled ? 'text-success' : 'text-destructive'}`}>
                      {requiredFieldsFilled ? 'Заполнены' : 'Не заполнены'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  size="lg"
                  disabled={loading || !requiredFieldsFilled}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                      Создание...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Создать отгрузку
                    </>
                  )}
                </Button>

                {!requiredFieldsFilled && (
                  <p className="text-xs text-muted-foreground text-center">
                    Заполните все обязательные поля (*)
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateShipment;