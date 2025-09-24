// NotActivated.tsx
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";

const NotActivated: React.FC = () => {
  const { error } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20">
        <div className="mb-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.05 5.56-5.022c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.136-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Аккаунт не активирован
          </h1>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <code className="text-red-200 text-sm">
                {error.message}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotActivated;