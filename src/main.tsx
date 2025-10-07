// main.tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyPolyfills, isTMA } from "@tma.js/bridge";

if (isTMA()) {
  (async () => {
    try {
      // 🔹 Применяем полифиллы, которые нужны для tma-js-bridge
      applyPolyfills();

      // 🔹 Рендерим приложение
      createRoot(document.getElementById("root")!).render(<App />);
    } catch (e) {
      console.error("Ошибка инициализации Mini App:", e);
      createRoot(document.getElementById("root")!).render(<App />);
    }
  })();
}else{
  createRoot(document.getElementById("root")!).render(<App />);
}