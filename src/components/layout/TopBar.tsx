"use client";

import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, Bell }  from "lucide-react";
import { useSidebar }          from "@/lib/sidebar-context";
import { Button }              from "@/components/ui/button";
import { getRoleColor }        from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function TopBar() {
  const { data: session } = useSession();
  const { toggle }        = useSidebar();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 lg:hidden" onClick={toggle}>
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
        <Bell className="h-4 w-4 text-gray-500" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors">
            <div className="h-7 w-7 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-white">
                {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-900 leading-none">{session?.user?.name}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 inline-block ${getRoleColor(session?.user?.role ?? "")}`}>
                {session?.user?.role?.replace("_", " ")}
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem className="text-sm text-red-600 cursor-pointer" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
