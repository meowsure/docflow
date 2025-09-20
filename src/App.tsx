import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import TelegramAuth from "@/components/TelegramAuth";
import Index from "./pages/Index";
import TaskDetail from "./pages/TaskDetail";
import CreateTask from "./pages/CreateTask";
import CreateShipment from "./pages/CreateShipment";
import TasksList from "./pages/TasksList";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { AppRoot } from '@telegram-apps/telegram-ui';

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <TelegramAuth />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/task/:id" element={<TaskDetail />} />
      <Route path="/create-task" element={<CreateTask />} />
      <Route path="/create-shipment" element={<CreateShipment />} />
      <Route path="/tasks" element={<TasksList />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </AppRoot>
);

export default App;