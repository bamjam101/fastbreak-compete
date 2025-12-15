"use client";

import { useGlobalStore } from "@/app/store/global";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar, ChevronUp, Home, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Navigation items data
const navigationItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        description: "Main dashboard overview",
      },
    ],
  },
  {
    title: "Scheduling",
    items: [
      {
        title: "Schedule",
        url: "/dashboard/schedule",
        icon: Calendar,
        description: "Manage game schedules",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Teams",
        url: "/dashboard/teams",
        icon: Users,
        description: "Manage teams",
      },
      {
        title: "Venues",
        url: "/dashboard/venues",
        icon: MapPin,
        description: "Manage venues",
      },
    ],
  },
];

// Flatten navigation items for mobile bottom nav
const flatNavItems = navigationItems.flatMap((group) => group.items);

// Mobile Bottom Navigation Component
function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-pb">
      <nav className="flex items-center justify-around px-2 py-2">
        {flatNavItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.title}
              href={item.url}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-2 rounded-lg transition-all ${
                isActive
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <item.icon
                className={`h-5 w-5 mb-1 ${isActive ? "text-blue-600" : ""}`}
              />
              <span
                className={`text-xs font-medium truncate ${
                  isActive ? "font-semibold" : ""
                }`}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// Desktop Sidebar Component
function DesktopSidebar() {
  const pathname = usePathname();
  const { toggleSidebar } = useGlobalStore();

  return (
    <Sidebar className="border-r border-slate-200 bg-slate-50">
      <SidebarHeader className="border-b border-slate-200 px-4 py-3.5 min-h-[8svh]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-blue-800 text-white font-bold text-sm">
            FB
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-slate-900">
              Fastbreak AI
            </span>
            <span className="truncate text-xs text-slate-600">
              Sports Scheduling
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-medium text-slate-600 uppercase tracking-wider px-2 py-2">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-slate-100 ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600 font-semibold"
                            : "text-slate-700 hover:text-slate-900"
                        }`}
                      >
                        <Link href={item.url} onClick={() => toggleSidebar()}>
                          <item.icon
                            className={`h-4 w-4 ${
                              isActive ? "text-blue-600" : "text-slate-500"
                            }`}
                          />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="flex items-center gap-2 flex-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/admin.png" />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                    AU
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-slate-900">
                    Admin User
                  </span>
                  <span className="truncate text-xs text-slate-600">
                    League Manager
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <ChevronUp className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppSidebar() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileBottomNav />;
  }

  return <DesktopSidebar />;
}

// Legacy component for backward compatibility
export function DashboardSidebar() {
  return <AppSidebar />;
}
