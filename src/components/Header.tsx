import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Package, Send, Truck, User, Home, List, Bell, CreditCard, Database, Folder, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();

  const groupedNav = [
    {
      label: "Документооборот",
      items: [
        { path: "/tasks", label: "Мои задачи", icon: List },
        { path: "/create-task", label: "Создать задачу", icon: Send },
        { path: "/files", label: "Файлы", icon: Folder },
      ],
    },
    {
      label: "Логистика",
      items: [
        { path: "/create-shipment", label: "Создать отгрузку", icon: Truck },
        { path: "/shipments", label: "Отгрузки", icon: Package },
      ],
    },
    {
      label: "Финансы",
      items: [{ path: "/invoices", label: "Счета и оплаты", icon: CreditCard }],
    },
    {
      label: "Система",
      items: [
        { path: "/logs", label: "Логи", icon: Database },
        { path: "/notifications", label: "Уведомления", icon: Bell },
        { path: "/profile", label: "Профиль", icon: User },
      ],
    },
  ];

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Лого */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">DocFlow CRM</h1>
            </Link>

            {/* Навигация */}
            <nav className="hidden md:flex items-center space-x-4">
              <Button
                variant={location.pathname === "/" ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link to="/" className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Главная</span>
                </Link>
              </Button>

              {groupedNav.map((group) => (
                <DropdownMenu key={group.label}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <span>{group.label}</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {group.items.map((item) => (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link to={item.path} className="flex items-center space-x-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
