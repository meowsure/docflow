import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { init } from '@telegram-apps/sdk-react';

init();

createRoot(document.getElementById("root")!).render(<App />);