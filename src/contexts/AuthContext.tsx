import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type User = {
  id: string;
  telegram_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Авторизация через initData
  const signInWithTelegram = async (initData: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-auth`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        }
      );

      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        console.error("Auth error:", data.error);
      }
    } catch (err) {
      console.error("Auth request failed:", err);
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    // Загружаем сохранённого юзера
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
      setLoading(false);
    }

    // Проверяем initData от Telegram
    const initData = window.Telegram?.WebApp?.initData;
    if (initData) {
      signInWithTelegram(initData).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
