import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithTelegram: (initData: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Добавляем метод для обновления пользователя из локального контекста
  const updateUser = (newUser: User | null) => {
    setUser(newUser);
  };

  const checkBotAuthToken = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const telegramId = urlParams.get('telegram_id');
    const username = urlParams.get('username');
    const firstName = urlParams.get('first_name');
    const lastName = urlParams.get('last_name');

    if (token && telegramId) {
      try {
        setLoading(true);
        console.log('Found bot auth token, verifying...');

        const { data, error } = await supabase.functions.invoke('telegram-bot-auth', {
          body: { 
            action: 'verify_token',
            token,
            telegram_id: parseInt(telegramId),
            username,
            first_name: firstName,
            last_name: lastName
          }
        });

        if (error) throw error;

        const { user: authUser, access_token } = data;
        
        // Сохраняем пользователя и токен
        localStorage.setItem('docflow_user', JSON.stringify(authUser));
        localStorage.setItem('docflow_token', access_token);
        
        setUser(authUser);

        // Очищаем URL от параметров
        window.history.replaceState({}, document.title, window.location.pathname);
        
        console.log('Bot auth successful:', authUser);
        return true; // Указываем, что авторизация через бота прошла успешно
        
      } catch (error) {
        console.error('Bot auth error:', error);
        // Очищаем URL в случае ошибки
        window.history.replaceState({}, document.title, window.location.pathname);
        return false;
      } finally {
        setLoading(false);
      }
    }
    return false;
  };

  useEffect(() => {
    // Проверяем, есть ли сохраненный пользователь
    const checkAuth = async () => {
      // Сначала проверяем токен авторизации через бота
      const botAuthSuccess = await checkBotAuthToken();
      
      // Если пользователь не был установлен через бота, проверяем локальное хранилище
      if (!botAuthSuccess) {
        const savedUser = localStorage.getItem('docflow_user');
        const savedToken = localStorage.getItem('docflow_token');
        
        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser));
        }
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signInWithTelegram = async (initData: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('telegram-auth', {
        body: { initData }
      });

      if (error) throw error;

      const { user: authUser, access_token } = data;
      
      // Сохраняем пользователя и токен
      localStorage.setItem('docflow_user', JSON.stringify(authUser));
      localStorage.setItem('docflow_token', access_token);
      
      setUser(authUser);
      
    } catch (error) {
      console.error('Telegram auth error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('docflow_user');
    localStorage.removeItem('docflow_token');
    setUser(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithTelegram,
      signOut,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};