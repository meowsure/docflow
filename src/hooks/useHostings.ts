// hooks/useHostings.ts
import { useState, useEffect } from 'react';
import { Hosting } from '@/types/hosting';
import { mockHostings } from '@/data/mockHostings';

export const useHostings = () => {
  const [hostings, setHostings] = useState<Hosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      setHostings(mockHostings);
      setLoading(false);
    }, 500);
  }, []);

  const getHostingById = (id: string) => {
    return hostings.find(hosting => hosting.id === id);
  };

  const updateHosting = (id: string, updates: Partial<Hosting>) => {
    setHostings(prev => prev.map(hosting => 
      hosting.id === id ? { ...hosting, ...updates } : hosting
    ));
  };

  const deleteHosting = (id: string) => {
    setHostings(prev => prev.filter(hosting => hosting.id !== id));
    return true;
  };

  return {
    hostings,
    loading,
    getHostingById,
    updateHosting,
    deleteHosting
  };
};