import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: any;
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

const TestAuth: React.FC = () => {
  const { signInWithTelegram, updateUser, user } = useAuth();
  const [log, setLog] = useState<string>("");

  const appendLog = (msg: string) =>
    setLog((prev) => (prev ? prev + "\n" + msg : msg));

  // Авто-вход через initData
  useEffect(() => {
    appendLog("Checking Telegram WebApp...");
    if (window.Telegram?.WebApp) {
      appendLog("Telegram WebApp detected, calling ready()...");
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();

      if (window.Telegram.WebApp.initData) {
        appendLog("initData found, trying signInWithTelegram...");
        signInWithTelegram(window.Telegram.WebApp.initData)
          .then(() => appendLog("Auto login success!"))
          .catch((err) => appendLog("Auto login error: " + err));
      } else {
        appendLog("No initData found on load");
      }
    } else {
      appendLog("Telegram WebApp not detected");
    }
  }, []);

  const handleTelegramButton = async () => {
    if (!window.Telegram?.WebApp?.initData) {
      appendLog("No initData to authorize");
      return;
    }
    try {
      await signInWithTelegram(window.Telegram.WebApp.initData);
      appendLog("Button login success!");
    } catch (err: any) {
      appendLog("Button login error: " + (err?.message || err));
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

      <Button onClick={handleTelegramButton} className="w-full">
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

export default TestAuth;
