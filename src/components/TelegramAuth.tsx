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
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

const TelegramAuth: React.FC = () => {
  const { signInWithTelegram, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

  useEffect(() => {
    const isTelegram = !!window.Telegram?.WebApp;
    setIsTelegramWebApp(isTelegram);
    if (isTelegram) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      const initData = window.Telegram.WebApp.initData;
      if (initData) handleTelegramAuth(initData);
    }
  }, []);

  const handleTelegramAuth = async (initData: string) => {
    try {
      setLoading(true);
      await signInWithTelegram(initData);
      toast({ title: "Авторизация успешна", description: "Добро пожаловать в DocFlow CRM!" });
    } catch (err: any) {
      console.error("Telegram auth error:", err);
      toast({ variant: "destructive", title: "Ошибка авторизации", description: err?.message || "Неизвестная ошибка" });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAuth = () => {
    const demoUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      telegram_id: 123456789,
      first_name: "Demo",
      last_name: "User",
      username: "demouser",
      full_name: "Demo User",
    };
    updateUser(demoUser);
    localStorage.setItem("docflow_token", "demo-token");
    toast({ title: "Демо авторизация успешна", description: "Вы вошли как демо пользователь" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary-glow/10 p-4 space-y-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">DocFlow CRM</CardTitle>
          <p className="text-muted-foreground">Система управления документооборотом и отгрузками</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isTelegramWebApp ? (
            <Button onClick={() => handleTelegramAuth(window.Telegram!.WebApp!.initData)} disabled={loading} className="w-full" size="lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Авторизация...</> : <><Send className="w-4 h-4 mr-2" />Войти через Telegram</>}
            </Button>
          ) : (
            <>
              <div className="text-center text-sm text-muted-foreground">Для полной функциональности откройте приложение через Telegram бота</div>
              <Button onClick={handleDemoAuth} disabled={loading} variant="outline" className="w-full" size="lg">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Загрузка...</> : <><Send className="w-4 h-4 mr-2" />Демо вход</>}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramAuth;
