import { HomeIcon, MessageSquare, Package, FileText, User } from "lucide-react";
import Index from "./pages/Index.tsx";
import CreateShipment from "./pages/CreateShipment.tsx";
import CreateTask from "./pages/CreateTask.tsx";
import TasksList from "./pages/TasksList.tsx";
import Profile from "./pages/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";

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
    title: "Создать отправку",
    to: "/create-task",
    icon: <FileText className="h-4 w-4" />,
    page: <CreateTask />,
  },
  {
    title: "Создать отгрузку",
    to: "/create-shipment",
    icon: <Package className="h-4 w-4" />,
    page: <CreateShipment />,
  },
  {
    title: "Мои задачи",
    to: "/tasks",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <TasksList />,
  },
  {
    title: "Профиль",
    to: "/profile",
    icon: <User className="h-4 w-4" />,
    page: <Profile />,
  },
  {
    title: "404",
    to: "*",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <NotFound />,
  },
];