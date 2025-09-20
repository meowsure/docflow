import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";


const TelegramAuth: React.FC = () => {
  const { user, logout } = useAuth();

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
    </div>
  );
};

export default TelegramAuth;
