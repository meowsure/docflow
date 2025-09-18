// src/components/TestAuth.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLaunchParams } from "@telegram-apps/sdk-react";

const TestAuth: React.FC = () => {
  const { signInWithTelegram, updateUser, user } = useAuth();
  const launchParams = useLaunchParams();
  const [log, setLog] = useState<string>("");

  const appendLog = (msg: string) =>
    setLog((prev) => (prev ? prev + "\n" + msg : msg));

  useEffect(() => {
    appendLog("LaunchParams: " + JSON.stringify(launchParams, null, 2));

    const initDataRaw = launchParams.tgWebAppInitData;
    const initDataUnsafe = launchParams.tgWebAppData;

    if (initDataRaw) {
      appendLog("Found tgWebAppInitData (raw string), trying login...");
      signInWithTelegram(initDataRaw)
        .then(() => appendLog("Auto login success!"))
        .catch((err) => appendLog("Auto login error: " + err));
    } else if (initDataUnsafe) {
      appendLog("Found tgWebAppData (parsed object). Using demo login.");
      updateUser(initDataUnsafe.user);
    } else {
      appendLog("No initData found at all");
    }
  }, [launchParams]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Test Auth Page</h2>

      <pre className="mt-4 p-2 border rounded bg-gray-50 text-xs whitespace-pre-wrap">
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
