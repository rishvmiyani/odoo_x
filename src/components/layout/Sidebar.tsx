"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Truck, Navigation, Wrench,
  Fuel, Users, BarChart3, LogOut, Settings,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn, getRoleColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLE_PERMISSIONS } from "@/types";
import { useSidebar } from "@/lib/sidebar-context";
import type { Permission, UserRole } from "@/types";

interface NavItem {
  label:      string;
  href:       string;
  icon:       React.ElementType;
  permission: Permission | null;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Command Center",   href: "/dashboard",     icon: LayoutDashboard, permission: null                },
  { label: "Vehicle Registry", href: "/vehicles",      icon: Truck,           permission: "vehicles:read"    },
  { label: "Trip Dispatcher",  href: "/trips",         icon: Navigation,      permission: "trips:read"       },
  { label: "Maintenance",      href: "/maintenance",   icon: Wrench,          permission: "maintenance:read" },
  { label: "Fuel & Expenses",  href: "/fuel-expenses", icon: Fuel,            permission: "fuel:read"        },
  { label: "Driver Profiles",  href: "/drivers",       icon: Users,           permission: "drivers:write"    },
  { label: "Analytics",        href: "/analytics",     icon: BarChart3,       permission: "analytics:read"   },
];

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname                    = usePathname();
  const { data: session }           = useSession();

  const userRole   = session?.user?.role as UserRole | undefined;
  const userPerms  = userRole ? ROLE_PERMISSIONS[userRole] : [];

  const visibleNav = NAV_ITEMS.filter(
    (item) => item.permission === null || userPerms.includes(item.permission)
  );

  const initials = session?.user?.name
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  const roleLabel = userRole
    ?.replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-slate-900 text-white flex flex-col z-40 transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn("flex items-center h-16 px-4 border-b border-slate-700 shrink-0",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <Truck className="h-5 w-5 text-blue-400 shrink-0" />
            <span className="text-sm font-bold text-white tracking-tight truncate">FleetFlow AI</span>
          </div>
        )}
        {collapsed && <Truck className="h-5 w-5 text-blue-400" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-6 w-6 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {visibleNav.map((item) => {
          const Icon     = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          const linkClass = cn(
            "flex items-center h-9 rounded-md transition-colors text-sm",
            collapsed ? "justify-center px-0 w-full" : "gap-3 px-3",
            isActive
              ? "bg-blue-600 text-white font-medium"
              : "text-slate-400 hover:text-white hover:bg-slate-700"
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link href={item.href} className={linkClass}>
                    <Icon className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={linkClass}>
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings (disabled placeholder) */}
      <div className="px-2 pb-1">
        <div className={cn("flex items-center h-9 rounded-md text-sm text-slate-600 cursor-not-allowed",
          collapsed ? "justify-center" : "gap-3 px-3"
        )}>
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </div>
      </div>

      {/* User + Logout */}
      <div className="border-t border-slate-700 p-2 shrink-0">
        {!collapsed && session?.user && (
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-xs bg-slate-700 text-slate-200">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{session.user.name}</p>
              {userRole && (
                <span className={cn("text-xs px-1.5 py-0 rounded-full font-medium", getRoleColor(userRole))}>
                  {roleLabel}
                </span>
              )}
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors h-9",
            collapsed ? "px-0 justify-center" : "justify-start gap-3 px-3"
          )}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
