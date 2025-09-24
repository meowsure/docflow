// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { retrieveLaunchParams } from "@tma.js/bridge";
import api from "@/api";

export interface User {
  id: string | number;
  telegram_id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  photo_url?: string;
  email?: string;
  role_id?: string;
  role?: {
    id: string;
    name: string;
    permissions: string[];
    permissions_codes: string[];
  } | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthError {
  code?: string;
  message: string;
}

interface AuthContextProps {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
  error: AuthError | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState(true);

  // Добавляем метод для обновления пользователя из локального контекста


  useEffect(() => {

    const initAuth = async () => {
      setLoading(true);
      try {
        const launchParams = retrieveLaunchParams();

        const tgUser = launchParams.tgWebAppData?.user;

        if (!tgUser) {
          setError({
            code: 'tg_not_data',
            message: "Нет данных пользователя tgWebAppData.user"
          });
          return;
        }

        const mappedUser: User = {
          id: tgUser.id,
          telegram_id: tgUser.id,
          username: tgUser.username,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          full_name: `${tgUser.first_name || ""} ${tgUser.last_name || ""}`.trim(),
          photo_url: tgUser.photo_url
        };

        // Преобразуем в массив (если требуется именно массив объектов)
        const userArray = [mappedUser]; // Теперь это массив с одним элементом

        // Для отправки на бекенд используйте JSON-сериализацию
        const jsonData = JSON.stringify(userArray);

        // Отправляем на сервер
        try {
          const response = await api.post("/auth/telegram", { user: mappedUser, auth_date: Math.floor(new Date().getTime() / 1000) });

          if (response.status === 200 && response.data) {
            // const { token, user } = response.data;
            const { access_token, user } = response.data;

            // сохраняем токен для api.ts
            localStorage.setItem("auth_token", access_token);
            localStorage.setItem("user", JSON.stringify(user));

            setLoading(false);
            setUser(user);
            setError(null);
          } else {
            throw new Error("Авторизация на сервере не удалась");
          }

        } catch (apiError: any) {
          const errorData = apiError.response?.data;

          // Устанавливаем ошибку как объект
          setError({
            code: errorData?.code,
            message: errorData?.message || apiError.message || "Ошибка авторизации"
          });

          // Также сохраняем в localStorage для AppContent
          if (errorData?.code) {
            localStorage.setItem("auth_error_code", errorData.code);
          }
        }
      } catch (e: any) {
        setError({
          code: 'tg_not_data',
          message: "Ошибка при получении launchParams: "
        });
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