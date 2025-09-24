// TelegramAuth.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import LockBrowser from "./lockBrowser";
import Index from "@/pages/Index";
import NotActivated from './NotActivated';
import { useToast } from '@/hooks/use-toast';

const TelegramAuth: React.FC = () => {
  const { user, error, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message
      });
    }
  }, [error, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Проверяем код ошибки из localStorage
  const authErrorCode = localStorage.getItem("auth_error_code");

  if (!user) {
    if (authErrorCode === 'account_not_activated') {
      return <NotActivated />;
    }
    return <LockBrowser error={error?.message} />;
  }

  return (
    <Index />
  );

};

export default TelegramAuth;
