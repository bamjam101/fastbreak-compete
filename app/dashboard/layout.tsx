"use client";

import { AppSidebar } from "@/components/pages/dashboard/dashboard-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: {
      href: string;
      label: string;
    }[] = [];

    segments.forEach((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ href, label });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map(
                (
                  breadcrumb: {
                    href: string;
                    label: string;
                  },
                  index: number
                ) => (
                  <div
                    key={breadcrumb.href}
                    className="flex items-center gap-1.5"
                  >
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage className="text-slate-600">
                          {breadcrumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href={breadcrumb.href}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          {breadcrumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                )
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 overflow-auto bg-slate-50">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
