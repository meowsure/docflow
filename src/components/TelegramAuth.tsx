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
    <div className="p-4 space-y-2">
      <p>Нет авторизации через Telegram</p>
      {error && (
        <pre className="text-red-600 bg-gray-100 p-2 rounded whitespace-pre-wrap">{error}</pre>
      )}
      <p>Откройте приложение через Telegram Bot.</p>
    </div>
  );
};

export default TelegramAuth;
