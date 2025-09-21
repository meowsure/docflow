import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreditCard, FileText, Calendar, Search, Plus, Eye } from "lucide-react";

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const mockInvoices = [
    {
      id: 1,
      number: "СЧ-2024-001",
      client: "ООО Торговый дом",
      amount: 125000,
      currency: "₽",
      status: "Оплачен",
      dueDate: "2024-01-20",
      createdDate: "2024-01-10",
      items: 5,
      description: "Поставка строительных материалов"
    },
    {
      id: 2,
      number: "СЧ-2024-002",
      client: "ИП Петров",
      amount: 45000,
      currency: "₽",
      status: "Ожидает оплаты",
      dueDate: "2024-01-25",
      createdDate: "2024-01-15",
      items: 3,
      description: "Услуги по доставке"
    },
    {
      id: 3,
      number: "СЧ-2024-003",
      client: "ЗАО Строй Инвест",
      amount: 89500,
      currency: "₽",
      status: "Просрочен",
      dueDate: "2024-01-12",
      createdDate: "2024-01-05",
      items: 8,
      description: "Комплектующие для оборудования"
    },
    {
      id: 4,
      number: "СЧ-2024-004",
      client: "ООО Металл Сервис",
      amount: 200000,
      currency: "₽",
      status: "Черновик",
      dueDate: "2024-01-30",
      createdDate: "2024-01-18",
      items: 12,
      description: "Металлопрокат и фурнитура"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Оплачен":
        return "bg-green-100 text-green-800";
      case "Ожидает оплаты":
        return "bg-yellow-100 text-yellow-800";
      case "Просрочен":
        return "bg-red-100 text-red-800";
      case "Черновик":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + currency;
  };

  const filteredInvoices = mockInvoices.filter(invoice =>
    invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Счета и оплаты</h1>
          <p className="text-muted-foreground">Управление счетами и платежами</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Создать счет
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Оплачено</p>
                <p className="text-2xl font-bold text-green-600">125 000 ₽</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">К оплате</p>
                <p className="text-2xl font-bold text-yellow-600">45 000 ₽</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Просрочено</p>
                <p className="text-2xl font-bold text-red-600">89 500 ₽</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Всего счетов</p>
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск счетов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{invoice.number}</CardTitle>
                  <CardDescription>{invoice.client}</CardDescription>
                </div>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold">
                {formatAmount(invoice.amount, invoice.currency)}
              </div>
              <p className="text-sm text-muted-foreground">{invoice.description}</p>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Создан: {invoice.createdDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Срок оплаты: {invoice.dueDate}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {invoice.items} позиций
                </span>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Просмотреть
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Счета не найдены</h3>
            <p className="text-muted-foreground">Попробуйте изменить поисковый запрос</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Invoices;