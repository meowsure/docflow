// TelegramAuth.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import LockBrowser from "./lockBrowser";
import Index from "@/pages/Index";
import NotActivated from './NotActivated';
import { useToast } from '@/hooks/use-toast';

const TelegramAuth: React.FC = () => {
  const { user, error, loading, demoLogin } = useAuth();
  const { toast } = useToast();
  const [showDemoOption, setShowDemoOption] = useState(false);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message
      });
      
      // Показываем опцию демо-входа через 3 секунды после ошибки
      const timer = setTimeout(() => {
        setShowDemoOption(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error, toast]);

  // Обработчик демо-входа
  const handleDemoLogin = () => {
    demoLogin(); // Используем функцию из AuthContext
    toast({
      title: "Демо-режим",
      description: "Вы вошли в демо-режим для разработки",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Проверяем код ошибки из localStorage
  const authErrorCode = localStorage.getItem("auth_error_code");

  if (!user) {
    if (authErrorCode === 'account_not_activated') {
      return <NotActivated />;
    }
    
    return (
      <div className="relative min-h-screen">
        <LockBrowser error={error?.message} />
        
        {/* Кнопка демо-входа */}
        {showDemoOption && (
          <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
            <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-xs">
              <h3 className="font-semibold text-sm mb-2">Проблемы с входом?</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Используйте демо-режим для тестирования приложения
              </p>
              <button
                onClick={handleDemoLogin}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium py-2 px-3 rounded-md transition-colors"
              >
                Войти в демо-режим
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <Index />;
};

export default TelegramAuth;