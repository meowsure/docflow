// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { retrieveLaunchParams } from "@tma.js/bridge";
import api from "@/api";
import { Task } from "@/hooks/useTasks";
import { Notification } from "@/hooks/useNotifications";

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
  isActive?: boolean;
  tasks?: Task[];
  available_tasks?: Task[];
  mytasks?: Task[];
  notifications?: Notification[];
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
  isDemoMode: boolean;
  demoLogin: (demoUser?: User) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Демо-пользователь по умолчанию
const DEFAULT_DEMO_USER: User = {
    id: "01999b44-86f8-7098-b97a-9640b3b1627d",
    telegram_id: 670136142,
    username: "nellex_dev",
    first_name: "qweezy",
    last_name: null,
    photo_url: "https://t.me/i/userpic/320/qdZmirqUuQdI91RkxBzi7erk2qkjxaQUXGAG1VwDgA0.svg",
    full_name: "qweezy",
    email: null,
    isActive: true,
    role_id: 1,
    created_at: "2025-09-30T15:36:23.000000Z",
    updated_at: "2025-09-30T15:36:28.000000Z",
    deleted_at: null,
    tasks: [],
    mytasks: [],
    role: {
      id: 1,
      name: "Администратор",
      permissions: [
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
        "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
        "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
        "31", "32", "33", "34", "35", "36", "37", "38", "39", "40"
      ],
      isSystem: 1,
      created_at: "2025-09-30T15:36:28.000000Z",
      updated_at: "2025-09-30T15:36:28.000000Z",
      permissions_codes: [
        "view_users",
        "edit_users",
        "delete_users",
        "edit_tasks",
        "delete_tasks",
        "create_shipments",
        "view_shipments",
        "manage_shipments",
        "view_finances",
        "create_invoices",
        "delete_invoices",
        "edit_invoices",
        "view_logs",
        "admin_access",
        "create_task",
        "upload_files",
        "view_files",
        "delete_files",
        "activate_user",
        "deactivate_user",
        "system",
        "manage_users",
        "manage_roles",
        "notify_all",
        "hosting",
        "hosting_edit",
        "hosting_remove",
        "hosting_add",
        "view_servers",
        "create_servers",
        "update_servers",
        "delete_servers"
      ]
    }
  };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Демо-вход для разработки в браузере
  const demoLogin = (demoUser?: User) => {
    const userToLogin = demoUser || DEFAULT_DEMO_USER;
    setUser(userToLogin);
    setIsDemoMode(true);
    setError(null);
    setLoading(false);
    
    // Сохраняем в localStorage для сохранения состояния при перезагрузке
    localStorage.setItem("demo_user", JSON.stringify(userToLogin));
    localStorage.setItem("is_demo_mode", "true");
    localStorage.setItem("auth_token", "27|8KgpqVD0WUVB8Rvc736fb4ZAxcuNvdDfYVPJuHPJb8a6e200");
    localStorage.removeItem("auth_error_code");
  };

  useEffect(() => {
    // Проверяем, есть ли сохраненная демо-сессия
    const savedDemoMode = localStorage.getItem("is_demo_mode");
    const savedDemoUser = localStorage.getItem("demo_user");
    
    if (savedDemoMode === "true" && savedDemoUser) {
      try {
        const demoUser = JSON.parse(savedDemoUser);
        setUser(demoUser);
        setIsDemoMode(true);
        setLoading(false);
        return; // Прерываем выполнение, т.к. используем демо-режим
      } catch (e) {
        console.error("Ошибка при восстановлении демо-сессии:", e);
        localStorage.removeItem("is_demo_mode");
        localStorage.removeItem("demo_user");
      }
    }

    // Основная логика входа через Telegram (не изменена)
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

        // Отправляем на сервер
        try {
          const response = await api.post("/auth/telegram", { 
            user: mappedUser, 
            auth_date: Math.floor(new Date().getTime() / 1000) 
          });

          if (response.status === 200 && response.data) {
            const { access_token, user } = response.data;

            // сохраняем токен для api.ts
            localStorage.setItem("auth_token", access_token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("auth_error_code", "");

            setUser(user);
            setError(null);
          } else {
            throw new Error("Авторизация на сервере не удалась");
          }

        } catch (apiError: any) {
          const errorData = apiError.response?.data;

          setError({
            code: errorData?.code,
            message: errorData?.message || apiError.message || "Ошибка авторизации"
          });

          if (errorData?.code) {
            localStorage.setItem("auth_error_code", errorData.code);
          }
        }
      } catch (e: any) {
        setError({
          code: 'tg_not_data',
          message: "Ошибка при получении launchParams: " + e.message
        });
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = () => {
    setUser(null);
    setIsDemoMode(false);
    
    // Очищаем все данные аутентификации
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth_error_code");
    localStorage.removeItem("demo_user");
    localStorage.removeItem("is_demo_mode");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      logout, 
      error, 
      loading,
      isDemoMode,
      demoLogin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}