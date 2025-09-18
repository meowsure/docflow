import { createRoot } from "react-dom/client";
import { retrieveLaunchParams, init as initSDK } from '@telegram-apps/sdk-react';
import '@telegram-apps/telegram-ui/dist/styles.css';
import App from "./App.tsx";
import "./index.css";

(async () => {
  try {
    const launchParams = retrieveLaunchParams();
    const debug = import.meta.env.DEV;

    await initSDK({
      debug,
      eruda: debug,
      mockForMacOS: launchParams.tgWebAppPlatform === 'macos',
    });

    createRoot(document.getElementById("root")!).render(<App />);
  } catch (e) {
    console.error("Telegram SDK initialization failed:", e);
    // Здесь можно рендерить fallback для неподдерживаемой среды
  }
})();
