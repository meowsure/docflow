import { createRoot } from "react-dom/client";
import '@telegram-apps/telegram-ui/dist/styles.css';
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
