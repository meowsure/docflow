// Header.tsx
import { Button } from "@/components/ui/button";
import { FileText, Package, Send, Truck, User, Home, List, Bell, CreditCard, Database, Folder } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: "/", label: "Главная", icon: Home },
    { path: "/tasks", label: "Мои задачи", icon: List },
    { path: "/create-task", label: "Создать задачу", icon: Send },
    { path: "/create-shipment", label: "Создать отгрузку", icon: Truck },
    { path: "/shipments", label: "Отгрузки", icon: Package },
    { path: "/files", label: "Файлы", icon: Folder },
    { path: "/logs", label: "Логи", icon: Database },
    { path: "/notifications", label: "Уведомления", icon: Bell },
    { path: "/invoices", label: "Финансы", icon: CreditCard },
    { path: "/profile", label: "Профиль", icon: User },
  ];

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Логотип + меню */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">DocFlow CRM</h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link to={item.path} className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ))}
            </nav>
          </div>

          {/* Пользователь */}
          <div className="flex items-center space-x-2">
            {user ? (
              <span className="font-medium">{user.first_name}</span>
            ) : (
              <span className="text-muted-foreground">Демо Пользователь</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
