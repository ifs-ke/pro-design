
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Home, FileText, Calculator, BotMessageSquare, Building, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/projects", label: "Projects", icon: Building },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/crm", label: "CRM", icon: Users },
  { href: "/costing", label: "Costing Tool", icon: Calculator },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BotMessageSquare className="size-8 text-primary" />
            <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">
              DesignCost Pro
            </h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-2">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <main className="p-4 sm:p-6 lg:p-8">
            <div className="absolute top-4 right-4 z-20 md:hidden">
                <SidebarTrigger />
            </div>
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
