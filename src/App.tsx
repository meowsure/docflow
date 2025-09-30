// App.tsx
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
import Logs from "./pages/Logs";
import Shipments from "./pages/Shipments";
import Notifications from "./pages/Notifications";
import Invoices from "./pages/Invoices";
import { retrieveLaunchParams } from "@tma.js/bridge";
import Files from "./pages/Files";
import ShipmentDetail from "./pages/ShipmentDetail";
import AdminUsers from "./pages/AdminUsers";
import AdminRoles from "./pages/AdminRoles";
import InvoiceDetail from "./pages/InvoiceDetail";
import NotActivated from "./components/NotActivated";
import AdminNotifications from "./pages/AdminNotification";
import Hostings from "./pages/Hostings";
import HostingDetail from "./pages/HostingDetail";
import Navigation from "./components/Header";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const launchParams = retrieveLaunchParams();
  // Проверяем код ошибки в localStorage
  const authErrorCode = localStorage.getItem("auth_error_code");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Если есть ошибка "account_not_activated", показываем NotActivated
  if (authErrorCode === 'account_not_activated') {
    return <NotActivated />;
  }

  if (!user) {
    return <TelegramAuth />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 flex flex-col lg:ml-0">
        <div className="flex-1 container mx-auto p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/task/:id" element={<TaskDetail />} />
            <Route path="/create-task" element={<CreateTask />} />
            <Route path="/create-shipment" element={<CreateShipment />} />
            <Route path="/tasks" element={<TasksList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/files" element={<Files />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/shipments/:id" element={<ShipmentDetail />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/hostings" element={<Hostings />} />
            <Route path="/hostings/:id" element={<HostingDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App = () => (
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
);

export default App;