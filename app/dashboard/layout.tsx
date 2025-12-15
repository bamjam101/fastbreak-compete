"use client";

import { AppSidebar } from "@/components/pages/dashboard/dashboard-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
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
          <header className="flex items-center sticky top-0 z-40 bg-white border-b border-slate-200 min-h-[8svh]">
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
