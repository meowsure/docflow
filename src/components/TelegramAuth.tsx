// TelegramAuth.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import LockBrowser from "./lockBrowser";
import Index from "@/pages/Index";
import { useToast } from '@/hooks/use-toast';

const TelegramAuth: React.FC = () => {
  const { user, error, loading } = useAuth();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (

      <LockBrowser props={error}/>

    );
  }

  return (
    <Index />
  );

};

export default TelegramAuth;
