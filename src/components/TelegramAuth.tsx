// TelegramAuth.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import LockBrowser from "./lockBrowser";
import Index from "@/pages/Index";

const TelegramAuth: React.FC = () => {
  const { user, error, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <main>
        <LockBrowser />
        <p>{error}</p>
      </main>
    );
  }

  return (
    <Index />
  );

};

export default TelegramAuth;
