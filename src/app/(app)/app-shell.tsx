
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
import { Home, FileText, Calculator, Building, Users, HomeIcon, Receipt } from "lucide-react";
import { ThemeToggle } from "@/components/design/theme-toggle";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { use } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/properties", label: "Properties", icon: Home },
  { href: "/projects", label: "Projects", icon: Building },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/crm", label: "CRM", icon: Users },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/costing", label: "Costing Tool", icon: Calculator },
];

export default function AppShell({ 
    children,
    params
}: {
    children: React.ReactNode;
    params: any;
}) {
  const pathname = usePathname();
  // Ensure params are resolved before rendering children
  use(params);

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
                className="text-primary h-6 w-6"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
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
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <div className="group-data-[collapsible=icon]:hidden h-8" />
            <ThemeToggle />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <main className="p-4 sm:p-6 lg:p-8 relative">
             <div className="flex items-center justify-end md:hidden mb-4 -mt-2">
                <SidebarTrigger />
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
