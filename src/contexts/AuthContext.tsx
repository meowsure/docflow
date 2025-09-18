import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type User = {
  id: string;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithTelegram: (initData: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("docflow_user", JSON.stringify(newUser));
      localStorage.setItem("docflow_token", "demo-token"); // для демо
    } else {
      localStorage.removeItem("docflow_user");
      localStorage.removeItem("docflow_token");
    }
  };

  const signInWithTelegram = async (initData: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("telegram-auth", {
        body: { initData },
      });

      if (error) throw error;

      const { user: authUser, access_token } = data;
      setUser(authUser);
      localStorage.setItem("docflow_user", JSON.stringify(authUser));
      localStorage.setItem("docflow_token", access_token);
    } catch (err) {
      console.error("Telegram auth failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("docflow_user");
    localStorage.removeItem("docflow_token");
    await supabase.auth.signOut();
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Сначала проверяем локальное хранилище
        const savedUser = localStorage.getItem("docflow_user");
        const savedToken = localStorage.getItem("docflow_token");
        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser));
        } else {
          // Если есть initData от Telegram WebApp
          const initData = window.Telegram?.WebApp?.initData;
          if (initData) {
            await signInWithTelegram(initData);
          }
        }
      } catch (err) {
        console.error("AuthProvider init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithTelegram, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
