import React, { createContext, useContext, useEffect, useState } from "react";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import axios from "axios";

interface User {
  id: string | number;
  telegram_id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

interface AuthContextProps {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lp = useLaunchParams();

  useEffect(() => {
    const initAuth = async () => {
      if (!lp) return;

      // Пользователь Telegram
      const tgUser = lp.tgWebAppData?.user;
      const initData = lp.tgWebAppInitData;

      if (!tgUser) {
        setError("Нет данных пользователя от Telegram (tgWebAppData.user пустой)");
        return;
      }

      if (!initData) {
        setError("Нет данных initData от Telegram (tgWebAppInitData пустой)");
        return;
      }

      const mappedUser: User = {
        id: tgUser.id,
        telegram_id: tgUser.id,
        username: tgUser.username,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name,
        full_name: `${tgUser.first_name || ""} ${tgUser.last_name || ""}`.trim(),
      };

      setUser(mappedUser);

      // 👉 Отправляем initData на бэкенд
      try {
        const response = await axios.post("https://api.marzsure.ru:8444/api/v1/auth/telegram", {
          init_data: initData,
        });

        if (!response.data || response.status !== 200) {
          throw new Error(`Auth failed: ${response.status}`);
        }

        console.log("Успешная авторизация на API", response.data);
      } catch (e: any) {
        setError("Ошибка при авторизации на API: " + e.message);
      }
    };

    initAuth();
  }, [lp]);

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
