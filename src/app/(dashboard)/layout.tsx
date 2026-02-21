"use client";

import { SidebarProvider } from "@/lib/sidebar-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Toaster } from "sonner";
import { useSidebar } from "@/lib/sidebar-context";
import { cn } from "@/lib/utils";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar />
      <main className={cn(
        "pt-16 min-h-screen transition-all duration-300 ease-in-out",
        collapsed ? "pl-16" : "pl-60"
      )}>
        <div className="p-6 max-w-7xl mx-auto">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardShell>{children}</DashboardShell>
      </SidebarProvider>
    </TooltipProvider>
  );
}
