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
  const [log, setLog] = useState<string>(""); // Лог на экран

  const appendLog = (msg: string) =>
    setLog((prev) => (prev ? prev + "\n" + msg : msg));

  // Проверяем Telegram WebApp
  useEffect(() => {
    appendLog("Checking Telegram WebApp...");
    const isTelegram = !!window.Telegram?.WebApp;
    setIsTelegramWebApp(isTelegram);

    if (isTelegram) {
      appendLog("Telegram WebApp detected, initializing...");
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();

      // Попробуем авторизацию автоматически
      const initData = window.Telegram.WebApp.initData;
      if (initData) {
        appendLog("initData found, calling signInWithTelegram...");
        handleTelegramAuth(initData);
      } else {
        appendLog("No initData found on load");
      }
    }
  }, []);

  const handleTelegramAuth = async (initDataParam?: string) => {
    const initData = initDataParam || window.Telegram?.WebApp?.initData;
    if (!initData) {
      appendLog("No initData, cannot authorize");
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          "Нет данных авторизации от Telegram. Попробуйте перезапустить приложение через бота.",
      });
      return;
    }

    try {
      setLoading(true);
      appendLog("Calling signInWithTelegram...");
      await signInWithTelegram(initData);
      appendLog("Telegram auth success");

      toast({
        title: "Авторизация успешна",
        description: "Добро пожаловать в DocFlow CRM!",
      });
    } catch (error: any) {
      appendLog("Telegram auth error: " + (error?.message || error));
      toast({
        variant: "destructive",
        title: "Ошибка авторизации",
        description: `Не удалось войти через Telegram: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAuth = async () => {
    try {
      setLoading(true);
      appendLog("Starting demo auth...");

      const demoUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        telegram_id: 123456789,
        first_name: "Demo",
        last_name: "User",
        username: "demouser",
        full_name: "Demo User",
      };

      updateUser(demoUser);
      appendLog("Demo user set in context");

      toast({
        title: "Демо авторизация успешна",
        description: "Вы вошли как демо пользователь",
      });
    } catch (error) {
      appendLog("Demo auth error: " + (error as any).message);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось войти в демо режиме",
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
              onClick={() => handleTelegramAuth()}
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
            <>
              <div className="text-center text-sm text-muted-foreground">
                Для полной функциональности откройте приложение через Telegram бота
              </div>
              <Button
                onClick={handleDemoAuth}
                disabled={loading}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Демо вход
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Лог на экран */}
      <pre className="text-xs text-red-600 whitespace-pre-wrap">{log}</pre>
    </div>
  );
};

export default TelegramAuth;
