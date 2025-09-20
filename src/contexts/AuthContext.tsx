// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { retrieveLaunchParams } from "@tma.js/bridge";
import axios from "axios";

interface User {
  id: string | number;
  telegram_id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  photo_url?: string;
}

interface AuthContextProps {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
  error: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const launchParams = retrieveLaunchParams();

        // Получаем initData или альтернативно tgWebAppData
        let initData: string | undefined = launchParams.tgWebAppInitData;
        if (!initData && launchParams.tgWebAppData) {
          initData = JSON.stringify(launchParams.tgWebAppData);
        }

        if (!initData) {
          setError(
            "Нет данных для авторизации (initData или tgWebAppData пустые). " +
              JSON.stringify(launchParams)
          );
          setLoading(false);
          return;
        }

        const tgUser = launchParams.tgWebAppData?.user;
        if (!tgUser) {
          setError("Нет данных пользователя tgWebAppData.user");
          setLoading(false);
          return;
        }

        const mappedUser: User = {
          id: tgUser.id,
          telegram_id: tgUser.id,
          username: tgUser.username,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          full_name: `${tgUser.first_name || ""} ${tgUser.last_name || ""}`.trim(),
          photo_url: tgUser.photo_url,
        };

        setUser(mappedUser);

        // Отправляем на сервер
        try {
          const response = await axios.post(
            "https://api.marzsure.ru:8444/api/v1/auth/telegram",
            { init_data: initData }
          );

          if (!response.data || response.status !== 200) {
            throw new Error(`Авторизация на сервере не удалась: ${response.status}`);
          }

          console.log("Успешная авторизация на API:", response.data);
        } catch (apiError: any) {
          setError("Ошибка при авторизации на API: " + apiError.message);
        }
      } catch (e: any) {
        setError("Ошибка при получении launchParams: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
