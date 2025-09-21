// TelegramAuth.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import LockBrowser from "./lockBrowser";

const TelegramAuth: React.FC = () => {
  const { error, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <LockBrowser />
  );
};

export default TelegramAuth;
