"use client";

import { AppSidebar } from "@/components/pages/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bell, Menu, Search } from "lucide-react";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && <AppSidebar />}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-white border-b border-slate-200 min-h-[8svh]">
            <div className="flex items-center justify-between px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                {!isMobile && <SidebarTrigger />}
                {isMobile && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-blue-800 text-white font-bold text-xs">
                      FB
                    </div>
                    <span className="font-semibold text-slate-900">
                      Fastbreak
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 relative"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                </Button>
                {isMobile && (
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className={`flex-1 overflow-auto ${isMobile ? "pb-20" : ""}`}>
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && <AppSidebar />}
      </div>
    </SidebarProvider>
  );
}
