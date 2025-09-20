import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Package, Send, Truck, User, Home, List, LogOut, LogIn, PowerOffIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/', label: 'Главная', icon: Home },
    { path: '/tasks', label: 'Мои задачи', icon: List },
    { path: '/create-task', label: 'Отправка', icon: Send },
    { path: '/create-shipment', label: 'Отгрузка', icon: Package },
    { path: '/profile', label: 'Профиль', icon: PowerOffIcon },
  ];

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
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

          <div className="flex items-center space-x-2">
            {user ? (
              <span>{user.first_name}</span>
            ) : (
              <span>Демо Пользователь</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
