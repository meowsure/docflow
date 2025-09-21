// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { retrieveLaunchParams, retrieveRawInitData } from "@tma.js/bridge";
import api from "@/api";

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
        const launchParamsStr = launchParams.tgWebAppData;
        // Преобразуем объект в query string
        const initDataString = Object.entries(launchParamsStr)
          .map(([key, value]) => {
            // Если значение является объектом (как user), преобразуем его в JSON строку
            if (typeof value === 'object' && value !== null) {
              return `${key}=${encodeURIComponent(JSON.stringify(value))}`;
            }
            // Для простых значений просто кодируем
            return `${key}=${encodeURIComponent(value)}`;
          })
          .join('&');

        if (!launchParams) {
          setError("tgWebAppInitData отсутствует или имеет неверный формат");
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


        // Отправляем на сервер
        try {
          const response = await api.post("/auth/telegram", { initdata: initDataString });

          if (response.status === 200 && response.data) {
            // const { token, user } = response.data;
            const { access_token, user } = response.data;

            // сохраняем токен для api.ts
            localStorage.setItem("auth_token", access_token);
            localStorage.setItem("user", JSON.stringify(user));

            setLoading(false);
            setUser(user);
          } else {
            throw new Error("Авторизация на сервере не удалась");
          }

        } catch (apiError: any) {
          setError("Ошибка при авторизации на API: " + apiError.response?.data?.message || apiError.message || apiError);
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