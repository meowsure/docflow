import React, { createContext, useContext, useEffect, useState } from "react";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import api from "@/api";
import axios from "axios";

interface User {
  id: string | number;
  telegram_id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role_id?: number;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  setUser: (u: User | null) => void;
  login: (initData: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));
  const [loading, setLoading] = useState(true);
  const lp = useLaunchParams();

  const login = async (initData: string) => {
    if (!initData) return;

    setLoading(true);
    try {
      const response = await axios.post("https://api.marzsure.ru:8444/api/v1/auth/telegram", {
        init_data: initData,
      });

      if (!response.data || response.status !== 200) {
        throw new Error(`Auth failed: ${response.status}`);
      }

      const data = response.data;
      setToken(data.access_token);
      setUser(data.user);

      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Login error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        try {
          const response = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (!response.data || response.status !== 200) {
            throw new Error("Token invalid");
          }
        } catch {
          logout();
        }
      }

      // Ждем пока Telegram SDK подгрузит initData
      if (lp && lp.tgWebAppInitData) {
        await login(lp.tgWebAppInitData);
      }

      setLoading(false);
    };

    initAuth();
  }, [lp?.tgWebAppInitData]);

  return (
    <AuthContext.Provider value={{ user, token, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
