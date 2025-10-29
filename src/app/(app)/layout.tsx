
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, FileText, Calculator, Building, Users, HomeIcon } from "lucide-react";
import { ThemeToggle } from "@/components/design/theme-toggle";
import { ThemeProvider } from "@/components/providers/theme-provider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/properties", label: "Properties", icon: Home },
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
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <Sidebar side="left" variant="sidebar" collapsible="icon">
          <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
              >
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.3 10.7 18 9.9 18 9c0-1.1-.9-2-2-2s-2 .9-2 2" />
                  <path d="M12 14c.2-1 .7-1.7 1.5-2.5C14.3 10.7 15 9.9 15 9c0-1.1-.9-2-2-2s-2 .9-2 2" />
                  <path d="M10 22v-5" />
                  <path d="M8 14c.2-1 .7-1.7 1.5-2.5C10.3 10.7 11 9.9 11 9c0-1.1-.9-2-2-2s-2 .9-2 2" />
                  <path d="M14 22v-4" />
                  <path d="M6 22v-2" />
                  <path d="M4 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M18 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
              </svg>
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
                      size="lg"
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
          <SidebarFooter className="p-2 mt-auto flex-col items-center group-data-[collapsible=icon]:items-center">
              <div className="group-data-[collapsible=icon]:hidden h-8" />
              <ThemeToggle />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <main className="p-4 sm:p-6 lg:p-8 relative">
              <div className="flex items-center justify-end md:hidden mb-4 -mt-2">
                  <SidebarTrigger className="md:hidden" />
              </div>
              <div className="mx-auto w-full max-w-7xl">
                  {children}
              </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
