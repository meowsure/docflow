// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { retrieveLaunchParams, retrieveRawLaunchParams, retrieveRawInitData } from "@tma.js/bridge";
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
        const testParams = retrieveRawInitData();
        // превращаем в объект
        const params = new URLSearchParams(testParams);
        // достаём auth_date
        const authDate = params.get("auth_date");
        const tgUser = launchParams.tgWebAppData?.user;

        if (!tgUser) {
          setError("Нет данных пользователя tgWebAppData.user");
          return;
        }

        // Собираем user JSON
        const userJson = encodeURIComponent(JSON.stringify({
          id: tgUser.id,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          username: tgUser.username,
          photo_url: tgUser.photo_url,
          language_code: tgUser.language_code,
        }));

        // Строим initData строку (БЕЗ signature)
        const initDataParts: string[] = [];
        if (launchParams.tgWebAppData?.query_id) initDataParts.push(`query_id=${launchParams.tgWebAppData?.query_id}`);
        initDataParts.push(`user=${userJson}`);
        if (authDate) initDataParts.push(`auth_date=${authDate}`);
        if (launchParams.tgWebAppData?.hash) initDataParts.push(`hash=${launchParams.tgWebAppData?.hash}`);

        const cleanInitData = initDataParts.join("&");

        const mappedUser: User = {
          id: tgUser.id,
          telegram_id: tgUser.id,
          username: tgUser.username,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          full_name: `${tgUser.first_name || ""} ${tgUser.last_name || ""}`.trim(),
          photo_url: tgUser.photo_url,
        };
        // setUser(mappedUser);

        // Отправляем на сервер
        try {
          const response = await api.post("/auth/telegram", { initData: cleanInitData });

          if (response.status === 200 && response.data) {
            // const { token, user } = response.data;
            const { access_token, user } = response.data;

            // сохраняем токен для api.ts
            localStorage.setItem("auth_token", access_token);
            localStorage.setItem("user", JSON.stringify(user));

            setLoading(false);
            setUser(user);
            // setError("Было отправлено initData: " + cleanInitData);
          } else {
            throw new Error("Авторизация на сервере не удалась");
          }

        } catch (apiError: any) {
          setError("Ошибка при авторизации на API: " + apiError.response?.data?.message || apiError.message || apiError);
          // setError("Было отправлено initData: " + cleanInitData);
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