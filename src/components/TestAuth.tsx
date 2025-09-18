import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { TelegramAppProvider, useTelegramApp } from "@telegram-apps/sdk-react";

const TestAuthInner: React.FC = () => {
  const { user, updateUser } = useAuth();
  const tgApp = useTelegramApp();
  const [log, setLog] = useState<string>("");

  const appendLog = (msg: string) =>
    setLog((prev) => (prev ? prev + "\n" + msg : msg));

  // Авто-вход через Telegram SDK
  useEffect(() => {
    if (!tgApp) return;

    appendLog("Telegram SDK initialized");

    if (tgApp.isAuthorized) {
      appendLog("User is authorized, setting user in context...");
      updateUser(tgApp.user); // tgApp.user содержит id, first_name, last_name, username
    } else {
      appendLog("User not authorized yet");
    }
  }, [tgApp]);

  const handleTelegramLogin = async () => {
    if (!tgApp) {
      appendLog("Telegram SDK not ready");
      return;
    }
    try {
      appendLog("Calling tgApp.login()...");
      const loggedUser = await tgApp.login();
      appendLog("Login success: " + JSON.stringify(loggedUser));
      updateUser(loggedUser);
    } catch (err: any) {
      appendLog("Login error: " + (err?.message || err));
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: "demo-123",
      telegram_id: 123456,
      username: "demo_user",
      first_name: "Demo",
      last_name: "User",
      full_name: "Demo User",
    };
    updateUser(demoUser);
    appendLog("Demo login set");
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Test Auth Page</h2>

      <Button onClick={handleTelegramLogin} className="w-full">
        Войти через Telegram (кнопка)
      </Button>

      <Button onClick={handleDemoLogin} className="w-full" variant="outline">
        Демо вход
      </Button>

      <pre className="mt-4 p-2 border rounded bg-gray-50 text-sm whitespace-pre-wrap">
        {log}
      </pre>

      <div className="mt-4">
        <strong>Текущий пользователь:</strong>
        <pre>{user ? JSON.stringify(user, null, 2) : "не авторизован"}</pre>
      </div>
    </div>
  );
};

const TestAuth: React.FC = () => {
  return (
    <TelegramAppProvider>
      <TestAuthInner />
    </TelegramAppProvider>
  );
};

export default TestAuth;
