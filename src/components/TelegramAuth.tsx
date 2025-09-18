import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [showBotAuth, setShowBotAuth] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем, запущено ли приложение в Telegram Web App
    console.log('Telegram detection:', {
      telegramWebApp: !!window.Telegram?.WebApp,
      initData: window.Telegram?.WebApp?.initData,
      search: window.location.search,
      userAgent: navigator.userAgent,
      isIframe: window.parent !== window
    });
    
    // Проверяем несколько способов определения Telegram Web App
    const isTelegram = !!(
      window.Telegram?.WebApp || 
      window.location.search.includes('tgWebAppData') ||
      window.location.search.includes('tgWebAppPlatform') ||
      navigator.userAgent.includes('TelegramBot') ||
      navigator.userAgent.includes('Telegram') ||
      window.parent !== window // iframe
    );
    
    console.log('Is Telegram detected:', isTelegram);
    
    if (isTelegram) {
      setIsTelegramWebApp(true);
      if (window.Telegram?.WebApp) {
        console.log('Initializing Telegram WebApp...');
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      }
    }
  }, []);

  const handleTelegramAuth = async () => {
    console.log('Attempting Telegram auth...', {
      hasWebApp: !!window.Telegram?.WebApp,
      initData: window.Telegram?.WebApp?.initData,
      initDataUnsafe: window.Telegram?.WebApp?.initDataUnsafe
    });

    if (!window.Telegram?.WebApp?.initData) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Нет данных авторизации от Telegram. Попробуйте перезапустить приложение через бота."
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Calling signInWithTelegram...');
      await signInWithTelegram(window.Telegram.WebApp.initData);
      
      toast({
        title: "Авторизация успешна",
        description: "Добро пожаловать в DocFlow CRM!"
      });
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        variant: "destructive",
        title: "Ошибка авторизации",
        description: `Не удалось войти через Telegram: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAuth = async () => {
    try {
      setLoading(true);
      
      // Временная демо-авторизация для тестирования без Edge Function
      const demoUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        telegram_id: 123456789,
        first_name: "Demo",
        last_name: "User", 
        username: "demouser",
        full_name: "Demo User"
      };
      
      localStorage.setItem('docflow_user', JSON.stringify(demoUser));
      localStorage.setItem('docflow_token', 'demo-token');
      
      // Обновляем состояние через контекст вместо перезагрузки
      updateUser(demoUser);
      
      toast({
        title: "Демо авторизация успешна",
        description: "Вы вошли как демо пользователь"
      });
      
    } catch (error) {
      console.error('Demo auth error:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось войти в демо режиме"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBotAuth = async () => {
    if (!authToken) {
      // Generate token
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('telegram-bot-auth', {
          body: { action: 'generate_token' }
        });

        if (error) throw error;

        setAuthToken(data.token);
        setShowBotAuth(true);
        
        toast({
          title: "Токен сгенерирован",
          description: "Скопируйте команду и отправьте её боту в Telegram"
        });
      } catch (error) {
        console.error('Token generation error:', error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось сгенерировать токен"
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Copy command to clipboard
      const command = `/start?token=${authToken}`;
      navigator.clipboard.writeText(command).then(() => {
        toast({
          title: "Команда скопирована",
          description: "Вставьте команду в Telegram боте"
        });
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-glow/10 p-4">
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
              onClick={handleTelegramAuth}
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
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Для полной функциональности откройте приложение через Telegram бота
              </div>
              
              <Button 
                onClick={handleBotAuth}
                disabled={loading}
                className="w-full"
                size="lg"
                variant="default"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Генерация токена...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {authToken ? 'Скопировать команду' : 'Войти через бота'}
                  </>
                )}
              </Button>

              {showBotAuth && authToken && (
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="text-sm font-medium">Инструкция:</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>1. Нажмите кнопку выше, чтобы скопировать команду</div>
                    <div>2. Откройте Telegram и найдите вашего бота</div>
                    <div>3. Вставьте и отправьте команду боту</div>
                    <div>4. Вернитесь сюда - авторизация произойдет автоматически</div>
                  </div>
                  <div className="text-xs p-2 bg-background rounded border font-mono break-all">
                    /start?token={authToken}
                  </div>
                  <div className="text-xs text-amber-600">
                    ⏰ Токен действителен 10 минут
                  </div>
                </div>
              )}
              
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
              
              <div className="text-xs text-center text-muted-foreground">
                В демо режиме некоторые функции могут быть ограничены
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramAuth;