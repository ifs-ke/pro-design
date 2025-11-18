
'use client';

import { useStore } from "@/store/cost-store";
import type { DashboardMetrics } from "@/store/types";
import { useIsHydrated } from "@/hooks/use-hydrated-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Calculator, ArrowRight, Users, CheckCircle, Building, Banknote, TrendingUp } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { DashboardCharts } from "@/components/design/dashboard-charts";
import { useMemo } from "react";

export default function DashboardPage() {
  const { clients, projects, quotes } = useStore();
  const isLoading = !useIsHydrated();

  const dashboardMetrics: Omit<DashboardMetrics, 'totalInvoices' | 'totalOutstandingAmount' | 'totalOverdueAmount' | 'totalPaidAmount' | 'effectiveWorkHours'> | null = useMemo(() => {
    if (isLoading) return null;

    const safeQuotes = quotes || [];
    const safeClients = clients || [];
    const safeProjects = projects || [];

    const approvedQuotes = safeQuotes.filter(q => q.status === 'Approved');
    
    const approvedRevenue = approvedQuotes.reduce((sum, q) => sum + (q.calculations?.totalPrice || 0), 0);
    const totalProfit = approvedQuotes.reduce((sum, q) => sum + (q.calculations?.profitAmount || 0), 0);

    const approvalRate = safeQuotes.length > 0 ? (approvedQuotes.length / safeQuotes.length) * 100 : 0;

    const clientStatusCounts = safeClients
      .filter(c => c.status)
      .reduce((acc, client) => {
          acc[client.status] = (acc[client.status] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);
    const clientStatusData = Object.entries(clientStatusCounts).map(([name, value]) => ({ name, value }));
    
    const quoteStatusCounts = safeQuotes
      .filter(q => q.status)
      .reduce((acc, quote) => {
          acc[quote.status] = (acc[quote.status] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);
    const quoteStatusData = Object.entries(quoteStatusCounts).map(([name, value]) => ({ name, value }));

    const projectStatusCounts = safeProjects
      .filter(p => p.status)
      .reduce((acc, project) => {
          acc[project.status] = (acc[project.status] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);
    const projectStatusData = Object.entries(projectStatusCounts).map(([name, value]) => ({ name, value }));

    return {
      totalClients: safeClients.length,
      totalProjects: safeProjects.length,
      totalQuotes: safeQuotes.length,
      approvedRevenue,
      approvalRate,
      totalApprovedQuotes: approvedQuotes.length,
      clientStatusData,
      projectStatusData,
      quoteStatusData,
      totalProfit,
    };
  }, [clients, projects, quotes, isLoading]);


  if (isLoading || !dashboardMetrics) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-lg">Loading Dashboard...</div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back!</h1>
        <p className="text-muted-foreground mt-1">Here's a quick overview of your business.</p>
      </header>
        
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Revenue</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardMetrics.approvedRevenue)}</div>
            <p className="text-xs text-muted-foreground">From {dashboardMetrics.totalApprovedQuotes} approved quotes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardMetrics.totalProfit)}</div>
            <p className="text-xs text-muted-foreground">From approved quotes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quote Approval</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.approvalRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{dashboardMetrics.totalApprovedQuotes} of {dashboardMetrics.totalQuotes} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{formatNumber(dashboardMetrics.totalClients, { notation: 'compact' })}</div>
            <p className="text-xs text-muted-foreground">Total clients in your CRM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{formatNumber(dashboardMetrics.totalProjects, { notation: 'compact' })}</div>
            <p className="text-xs text-muted-foreground">Total projects created</p>
          </CardContent>
        </Card>
      </div>
      
      <DashboardCharts
        clientStatusData={dashboardMetrics.clientStatusData}
        projectStatusData={dashboardMetrics.projectStatusData}
        quoteStatusData={dashboardMetrics.quoteStatusData}
      />


      <Card className="flex flex-col items-center justify-between p-8 text-center bg-primary/5 sm:flex-row">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Calculator className="size-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Ready to Start a New Project?</h2>
          <p className="text-muted-foreground mt-1 max-w-md">Create a detailed cost analysis and generate a professional quote in minutes.</p>
        </div>
        <Link href="/costing" className="mt-6 sm:mt-0">
          <Button size="lg">
            Start Costing
            <ArrowRight className="ml-2" />
          </Button>
        </Link>
      </Card>

    </div>
  );
}
