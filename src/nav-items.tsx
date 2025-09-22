import { 
  HomeIcon, 
  MessageSquare, 
  Package, 
  FileText, 
  User,
  List,
  Send,
  Folder,
  Truck,
  CreditCard,
  Bell,
  Database,
  Settings,
  Group
} from "lucide-react";
import Index from "./pages/Index.tsx";
import CreateShipment from "./pages/CreateShipment.tsx";
import CreateTask from "./pages/CreateTask.tsx";
import TasksList from "./pages/TasksList.tsx";
import Profile from "./pages/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";
import Shipments from "./pages/Shipments.tsx";
import Invoices from "./pages/Invoices.tsx";
import Notifications from "./pages/Notifications.tsx";
import Files from "./pages/Files.tsx";
import AdminUsers from "./pages/AdminUsers.tsx";
import AdminRoles from "./pages/AdminRoles.tsx";
import Logs from "./pages/Logs.tsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Главная",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Мои задачи",
    to: "/tasks",
    icon: <List className="h-4 w-4" />,
    page: <TasksList />,
  },
  {
    title: "Создать задачу",
    to: "/create-task",
    icon: <Send className="h-4 w-4" />,
    page: <CreateTask />,
  },
  {
    title: "Файлы",
    to: "/files",
    icon: <Folder className="h-4 w-4" />,
    page: <Files />,
  },
  {
    title: "Создать отгрузку",
    to: "/create-shipment",
    icon: <Truck className="h-4 w-4" />,
    page: <CreateShipment />,
  },
  {
    title: "Отгрузки",
    to: "/shipments",
    icon: <Package className="h-4 w-4" />,
    page: <Shipments />,
  },
  {
    title: "Счета и оплаты",
    to: "/invoices",
    icon: <CreditCard className="h-4 w-4" />,
    page: <Invoices />,
  },
  {
    title: "Уведомления",
    to: "/notifications",
    icon: <Bell className="h-4 w-4" />,
    page: <Notifications />,
  },
  {
    title: "Профиль",
    to: "/profile",
    icon: <User className="h-4 w-4" />,
    page: <Profile />,
  },
  {
    title: "Логи",
    to: "/logs",
    icon: <Database className="h-4 w-4" />,
    page: <Logs />,
  },
  {
    title: "Пользователи",
    to: "/admin/users",
    icon: <User className="h-4 w-4" />,
    page: <AdminUsers />,
  },
  {
    title: "Роли",
    to: "/admin/roles",
    icon: <Group className="h-4 w-4" />,
    page: <AdminRoles />,
  },
  {
    title: "404",
    to: "*",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <NotFound />,
  },
];