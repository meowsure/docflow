import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api";

const TelegramAuth: React.FC = () => {
  const { user, logout } = useAuth();

  const response = api.get("https://api.marzsure.ru:8444/api/v1/auth/me");

  const text = response.data;
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
      <p>Откройте приложение внутри Telegram</p>
      <code>{text}</code>
    </div>
  );
};

export default TelegramAuth;
