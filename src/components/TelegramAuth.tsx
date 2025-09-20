import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { retrieveLaunchParams } from "@telegram-apps/sdk-react";

const TelegramAuth: React.FC = () => {
  const { user, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const launchParams = retrieveLaunchParams();
      if (!launchParams.tgWebAppInitData) {
        setError("Нет данных от Telegram (tgWebAppInitData пустой)");
      }
    } catch (e: any) {
      setError("Ошибка при получении launchParams: " + e.message);
    }
  }, []);

  if (user) {
    return (
      <div className="p-4 space-y-2">
        <p>Вы вошли как <b>@{user.username}</b></p>
        <Button onClick={logout}>Выйти</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <p>Нет авторизации через Telegram</p>
      {error && (
        <pre className="text-red-600 bg-gray-100 p-2 rounded">{error}</pre>
      )}
      <p>Откройте приложение внутри Telegram</p>
    </div>
  );
};

export default TelegramAuth;
