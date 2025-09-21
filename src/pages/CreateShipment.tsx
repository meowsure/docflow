import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FileUploader from "@/components/FileUploader";
import Header from "@/components/Header";
import { ArrowLeft, Package, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useShipments } from '@/hooks/useShipments';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

const CreateShipment = () => {
  const { toast } = useToast();
  const { fetchItems } = useShipments();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Необходимо загрузить хотя бы один файл"
      });
      return;
    }

    if (!formData.address || !formData.goodsName || !formData.contractNumber) {
      toast({
        variant: "destructive", 
        title: "Ошибка",
        description: "Заполните обязательные поля"
      });
      return;
    }

    try {
      setLoading(true);
      
      const task = await createTask({
        task_type: 'shipment',
        description: `Отгрузка: ${formData.goodsName}`,
        address: formData.address,
        shop_name: formData.shopName,
        goods_name: formData.goodsName,
        goods_volume: formData.goodsVolume,
        goods_weight: formData.goodsWeight,
        goods_package: formData.goodsPackage,
        contract_number: formData.contractNumber,
        loading_date: formData.loadingDate,
        loading_requirements: formData.loadingRequirements,
        loading_contacts: formData.loadingContacts,
        request_code: formData.requestCode,
        schedule: formData.workSchedule,
        additional_info: formData.additionalInfo,
        status: 'submitted',
        user_id: user?.id || ''
      });

      if (task) {
        toast({
          title: "Отгрузка создана",
          description: "Заявка отправлена менеджеру отгрузок"
        });
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Create shipment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" className="mb-4" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📋</span>
                  <span>Документы</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Загрузите спецификацию и договор
                </p>
                <FileUploader onFilesChange={setFiles} maxFiles={10} />
              </CardContent>
            </Card>

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
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Введите полный адрес склада..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="workSchedule">Время работы склада</Label>
                  <Input
                    id="workSchedule"
                    value={formData.workSchedule}
                    onChange={(e) => handleInputChange('workSchedule', e.target.value)}
                    placeholder="Пн-Пт 9:00-18:00"
                  />
                </div>

                <div>
                  <Label htmlFor="requestCode">Код заявки для склада</Label>
                  <Input
                    id="requestCode"
                    value={formData.requestCode}
                    onChange={(e) => handleInputChange('requestCode', e.target.value)}
                    placeholder="Введите код заявки или 'нет'"
                  />
                </div>

                <div>
                  <Label htmlFor="loadingContacts">Контакты ответственных лиц на загрузке</Label>
                  <Textarea
                    id="loadingContacts"
                    value={formData.loadingContacts}
                    onChange={(e) => handleInputChange('loadingContacts', e.target.value)}
                    placeholder="ФИО, должность, телефон..."
                  />
                </div>
              </CardContent>
            </Card>

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
                    value={formData.shopName}
                    onChange={(e) => handleInputChange('shopName', e.target.value)}
                    placeholder="От какой лавки подписались?"
                  />
                </div>

                <div>
                  <Label htmlFor="goodsName">Наименование товара *</Label>
                  <Input
                    id="goodsName"
                    value={formData.goodsName}
                    onChange={(e) => handleInputChange('goodsName', e.target.value)}
                    placeholder="Укажите наименование товара..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goodsVolume">Объем товара</Label>
                    <Input
                      id="goodsVolume"
                      value={formData.goodsVolume}
                      onChange={(e) => handleInputChange('goodsVolume', e.target.value)}
                      placeholder="Кол-во единиц, метры, штуки..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="goodsWeight">Вес товара</Label>
                    <Input
                      id="goodsWeight"
                      value={formData.goodsWeight}
                      onChange={(e) => handleInputChange('goodsWeight', e.target.value)}
                      placeholder="Укажите вес..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="goodsPackage">Тип упаковки</Label>
                  <Input
                    id="goodsPackage"
                    value={formData.goodsPackage}
                    onChange={(e) => handleInputChange('goodsPackage', e.target.value)}
                    placeholder="Паллеты, коробки, бухты..."
                  />
                </div>
              </CardContent>
            </Card>

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
                    value={formData.contractNumber}
                    onChange={(e) => handleInputChange('contractNumber', e.target.value)}
                    placeholder="Укажите номер договора..."
                  />
                </div>

                <div>
                  <Label htmlFor="loadingDate">Дата загрузки</Label>
                  <Input
                    id="loadingDate"
                    type="date"
                    value={formData.loadingDate}
                    onChange={(e) => handleInputChange('loadingDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="loadingRequirements">Особые требования к загрузке</Label>
                  <Textarea
                    id="loadingRequirements"
                    value={formData.loadingRequirements}
                    onChange={(e) => handleInputChange('loadingRequirements', e.target.value)}
                    placeholder="Укажите особые требования или 'нет'"
                  />
                </div>

                <div>
                  <Label htmlFor="additionalInfo">Дополнительная информация</Label>
                  <Textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    placeholder="Любая другая важная информация..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

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
                    <span>Заполнено полей:</span>
                    <span className="font-medium">
                      {Object.values(formData).filter(value => value.trim() !== '').length}/13
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSubmit} 
                  className="w-full"
                  size="lg"
                  disabled={loading}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateShipment;