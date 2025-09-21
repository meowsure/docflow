// TelegramAuth.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const TelegramAuth: React.FC = () => {
  const { user, logout, error, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="p-4 space-y-2">
        <p>Вы вошли как <b>@{user.username}</b></p>
        <Button onClick={logout}>Выйти</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2 bg-black/10">
      <p>Откройте приложение через бота в Telegram.</p>
      <code>{ error }</code>
    </div>
  );
};

export default TelegramAuth;
