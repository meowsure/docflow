import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { ArrowLeft } from "lucide-react";
import { useInvoices, Invoice, Payment } from "@/hooks/useInvoice";

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInvoice, addPayment } = useInvoices();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const data = await getInvoice(id);
        setInvoice(data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddPayment = async () => {
    if (!invoice) return;
    const newPayment: Partial<Payment> = {
      amount: 100, // заглушка, потом заменим на форму
      method: "card",
    };
    const data = await addPayment(invoice.id, newPayment);
    setInvoice({
      ...invoice,
      payments: [...(invoice.payments || []), data],
    });
  };

  if (loading) {
    return <div className="p-6">Загрузка...</div>;
  }

  if (!invoice) {
    return <div className="p-6">Счёт не найден</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <Button
          variant="ghost"
          className="mb-4 flex items-center"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Счёт #{invoice.number}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Клиент:</span>
                <span>{invoice.client}</span>
              </div>
              <div className="flex justify-between">
                <span>Сумма:</span>
                <span>
                  {invoice.amount} {invoice.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Статус:</span>
                <Badge>{invoice.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Дата создания:</span>
                <span>{invoice.createdDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Оплатить до:</span>
                <span>{invoice.dueDate}</span>
              </div>
              {invoice.description && (
                <div>
                  <span className="font-semibold">Описание:</span>
                  <p>{invoice.description}</p>
                </div>
              )}
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Платежи</h3>
                {invoice.payments && invoice.payments.length > 0 ? (
                  <ul className="space-y-2">
                    {invoice.payments.map((p) => (
                      <li
                        key={p.id}
                        className="flex justify-between border rounded p-2"
                      >
                        <span>
                          {p.amount} ({p.method})
                        </span>
                        <span>{p.paid_at || "—"}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Нет платежей</p>
                )}
                <Button className="mt-4" onClick={handleAddPayment}>
                  Добавить платёж
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
