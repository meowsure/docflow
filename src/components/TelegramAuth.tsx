import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: any;
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

const TelegramAuth: React.FC = () => {
  const { signInWithTelegram, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  const [log, setLog] = useState<string>("");

  const appendLog = (msg: string) =>
    setLog((prev) => (prev ? prev + "\n" + msg : msg));

  // Проверяем Telegram WebApp с polling
  useEffect(() => {
    const checkTelegram = async () => {
      if (window.Telegram?.WebApp) {
        setIsTelegramWebApp(true);
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();

        const initData = window.Telegram.WebApp.initData;
        if (initData) {
          appendLog("initData found, calling signInWithTelegram...");
          try {
            setLoading(true);
            await signInWithTelegram(initData);
            appendLog("Telegram auth success");
          } catch (err: any) {
            appendLog("Telegram auth error: " + (err?.message || err));
          } finally {
            setLoading(false);
          }
        }
      } else {
        setTimeout(checkTelegram, 100);
      }
    };
    checkTelegram();
  }, []);

  const handleTelegramButton = async () => {
    if (!window.Telegram?.WebApp?.initData) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Нет данных авторизации от Telegram.",
      });
      return;
    }

    try {
      setLoading(true);
      await signInWithTelegram(window.Telegram.WebApp.initData);
      toast({
        title: "Авторизация успешна",
        description: "Добро пожаловать в DocFlow CRM!",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: err?.message || "Неизвестная ошибка",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary-glow/10 p-4 space-y-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">DocFlow CRM</CardTitle>
          <p className="text-muted-foreground">
            Система управления документооборотом и отгрузками
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isTelegramWebApp ? (
            <Button
              onClick={handleTelegramButton}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Авторизация...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Войти через Telegram
                </>
              )}
            </Button>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Откройте приложение через Telegram для авторизации
            </div>
          )}
        </CardContent>
      </Card>
      <pre className="text-xs text-red-600 whitespace-pre-wrap">{log}</pre>
    </div>
  );
};

export default TelegramAuth;
