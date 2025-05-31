"use client";

import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Home,
  Ticket,
  Users,
  Calendar,
  Settings,
  LogOut,
  Bell,
  User,
  Wrench,
  BarChart3,
  BookOpen,
  Package,
  ClipboardList,
  Zap,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: "Dashboard", href: "/app/dashboard", icon: Home },
      { name: "Support Requests", href: "/app/support-requests", icon: Ticket },
      { name: "Knowledge Base", href: "/app/knowledge-base", icon: BookOpen },
    ];

    if (user?.role === "admin") {
      return [
        ...baseItems,
        { name: "Technicians", href: "/app/technicians", icon: Users },
        { name: "Appointments", href: "/app/appointments", icon: Calendar },
        { name: "Services", href: "/app/services", icon: Wrench },
        { name: "Inventory", href: "/app/inventory", icon: Package },
        {
          name: "Job Scheduling",
          href: "/app/scheduling",
          icon: ClipboardList,
        },
        { name: "Analytics", href: "/app/analytics", icon: BarChart3 },
        { name: "User Management", href: "/app/admin/users", icon: Users },
        {
          name: "Service Management",
          href: "/app/admin/services",
          icon: Settings,
        },
      ];
    }

    if (user?.role === "technician") {
      return [
        ...baseItems,
        { name: "Technician Dashboard", href: "/app/technician", icon: Wrench },
        {
          name: "Available Requests",
          href: "/app/technician/available",
          icon: Ticket,
        },
        {
          name: "My Requests",
          href: "/app/technician/requests",
          icon: ClipboardList,
        },
        {
          name: "Job Scheduling",
          href: "/app/scheduling",
          icon: ClipboardList,
        },
        { name: "Inventory", href: "/app/inventory", icon: Package },
        { name: "Appointments", href: "/app/appointments", icon: Calendar },
      ];
    }

    // Customer
    return [
      ...baseItems,
      { name: "Technicians", href: "/app/technicians", icon: Users },
      { name: "Appointments", href: "/app/appointments", icon: Calendar },
      { name: "Services", href: "/app/services", icon: Wrench },
    ];
  };

  const navigationItems = getNavigationItems();

  const isActiveLink = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b">
            <Link to="/app/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">Dern Support</h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActiveLink(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.username}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Theme</span>
                <ModeToggle />
              </div>
              <Link to="/app/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link to="/app/notifications">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
