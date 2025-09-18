import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLaunchParams } from '@telegram-apps/sdk-react';

const TestAuth: React.FC = () => {
  const { signInWithTelegram, updateUser, user } = useAuth();
  const { initDataRaw, initData } = useLaunchParams();
  const [log, setLog] = useState<string>('');

  const appendLog = (msg: string) => setLog((prev) => (prev ? prev + '\n' + msg : msg));

  useEffect(() => {
    appendLog('Проверка Telegram WebApp...');
    if (initData) {
      appendLog('initData найдено, пытаемся авторизоваться...');
      signInWithTelegram(initData)
        .then(() => appendLog('Авто-вход успешен!'))
        .catch((err) => appendLog('Ошибка авто-входа: ' + err));
    } else {
      appendLog('Нет initData');
    }
  }, [initData, signInWithTelegram]);

  const handleTelegramLogin = async () => {
    if (!initDataRaw) {
      appendLog('Нет данных для авторизации');
      return;
    }

    try {
      await signInWithTelegram(initDataRaw);
      appendLog('Авторизация прошла успешно');
    } catch (err) {
      appendLog('Ошибка авторизации: ' + err);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: 'demo-123',
      telegram_id: 123456,
      username: 'demo_user',
      first_name: 'Demo',
      last_name: 'User',
      full_name: 'Demo User',
    };
    updateUser(demoUser);
    appendLog('Демо-вход выполнен');
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Test Auth Page</h2>

      <Button onClick={handleTelegramLogin} className="w-full">
        Войти через Telegram
      </Button>

      <Button onClick={handleDemoLogin} className="w-full" variant="outline">
        Демо вход
      </Button>

      <pre className="mt-4 p-2 border rounded bg-gray-50 text-sm whitespace-pre-wrap">{log}</pre>

      <div className="mt-4">
        <strong>Текущий пользователь:</strong>
        <pre>{user ? JSON.stringify(user, null, 2) : 'не авторизован'}</pre>
      </div>
    </div>
  );
};

export default TestAuth;
