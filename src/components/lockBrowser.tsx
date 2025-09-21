// TelegramAuth.tsx
import React from "react";
import { Button } from "@/components/ui/button";

const lockBrowser: React.FC = () => {

  return (
    <div className="p-4 space-y-2 bg-black/10">
        <p>Это приложение доступно только в Telegram</p>
    </div>
  );
};

export default lockBrowser;
