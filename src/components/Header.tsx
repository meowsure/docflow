import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Package, Send, Truck, User, Home, List, Bell, CreditCard, Database, Folder, ChevronDown, Menu, X, Settings, Group } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

const Header = () => {
  const { items: notifications } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const groupedNav = [
    {
      label: "Документооборот",
      icon: Menu,
      items: [
        { path: "/tasks", label: "Мои задачи", icon: List },
        { path: "/create-task", label: "Создать задачу", icon: Send },
        { path: "/files", label: "Файлы", icon: Folder },
      ],
    },
    {
      label: "Логистика",
      icon: Menu,
      items: [
        { path: "/create-shipment", label: "Создать отгрузку", icon: Truck },
        { path: "/shipments", label: "Отгрузки", icon: Package },
      ],
    },
    {
      icon: Menu,
      label: "Финансы",
      items: [{ path: "/invoices", label: "Счета и оплаты", icon: CreditCard }],
    },
    {
      label: "Система",
      icon: Menu,
      items: [
        { path: "/notifications", label: "Уведомления", icon: Bell },
        { path: "/profile", label: "Профиль", icon: User },
      ],
    },
    {
      label: "Админ",
      icon: Settings,
      items: [
        { path: "/logs", label: "Логи", icon: Database },
        { path: "/admin/users", label: "Пользователи", icon: User },
        { path: "/admin/roles", label: "Роли", icon: Group },
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

            {/* Навигация для десктопа */}
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
                      <group.icon className="w-4 h-4" />
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

          {/* Пользователь + мобильное меню */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/notifications')}
              size="sm"
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.is_read) && (
                <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.photo_url} alt={user.first_name} />
                      <AvatarFallback>{user.first_name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium hidden md:block">{user.first_name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Профиль</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Настройки</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span className="text-muted-foreground hidden md:block">Демо Пользователь</span>
            )}

            {/* Кнопка мобильного меню */}

            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <nav className="flex flex-col md:hidden mt-4 space-y-2">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-2 py-2 rounded hover:bg-muted ${location.pathname === "/" ? "bg-muted" : ""
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="w-4 h-4" />
              <span>Главная</span>
            </Link>

            {groupedNav.map((group) => (
              <div key={group.label} className="border-t pt-2">
                <span className="text-sm font-semibold px-2">{group.label}</span>
                <div className="flex flex-col mt-1 space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-muted"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
