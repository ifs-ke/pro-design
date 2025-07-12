
"use client";

import { useEffect, useState, useMemo } from "react";
import { useStore } from "@/store/cost-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Calculator, ArrowRight, Users, FileText, BarChart2, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { BarChart, PieChart, Pie, Cell, ResponsiveContainer, Bar } from "recharts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots
} from "@/components/ui/carousel";

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function DashboardPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { publishedQuotes, projects, clients } = useStore();

  useEffect(() => {
    useStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  const dashboardMetrics = useMemo(() => {
    const totalQuotes = publishedQuotes.length;
    const approvedQuotes = publishedQuotes.filter(q => q.status === 'Approved');
    const approvedRevenue = approvedQuotes.reduce((sum, q) => sum + q.calculations.grandTotal, 0);
    const approvalRate = totalQuotes > 0 ? (approvedQuotes.length / totalQuotes) * 100 : 0;
    
    const clientStatusCounts = clients.reduce((acc, client) => {
        acc[client.status] = (acc[client.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const clientStatusData = Object.entries(clientStatusCounts).map(([name, value]) => ({ name, value }));
    
    const quoteStatusCounts = publishedQuotes.reduce((acc, quote) => {
        acc[quote.status] = (acc[quote.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const quoteStatusData = Object.entries(quoteStatusCounts).map(([name, value]) => ({ name, value, fill: `hsl(var(--chart-${Object.keys(quoteStatusCounts).indexOf(name) + 1}))` }));

    const projectStatusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const projectStatusData = Object.entries(projectStatusCounts).map(([name, value]) => ({ name, value, fill: `hsl(var(--chart-${Object.keys(projectStatusCounts).indexOf(name) + 1}))` }));


    return {
      totalClients: clients.length,
      totalProjects: projects.length,
      approvedRevenue,
      approvalRate,
      clientStatusData,
      quoteStatusData,
      projectStatusData,
    };
  }, [publishedQuotes, projects, clients]);

  if (!isHydrated) {
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
        <p className="text-muted-foreground mt-1">Here&apos;s a quick overview of your business.</p>
      </header>
        
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
           <CarouselItem className="md:basis-1/2 lg:basis-1/3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved Revenue</CardTitle>
                  <span className="text-muted-foreground">KES</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(dashboardMetrics.approvedRevenue)}</div>
                  <p className="text-xs text-muted-foreground">Total from approved quotes</p>
                </CardContent>
              </Card>
           </CarouselItem>
           <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardMetrics.totalClients}</div>
                   <p className="text-xs text-muted-foreground">{dashboardMetrics.totalProjects} total projects</p>
                </CardContent>
              </Card>
           </CarouselItem>
           <CarouselItem className="md:basis-1/2 lg:basis-1/3">
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quote Approval Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardMetrics.approvalRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">{publishedQuotes.filter(q => q.status === 'Approved').length} of {publishedQuotes.length} quotes</p>
                </CardContent>
              </Card>
           </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="-left-12" />
        <CarouselNext className="-right-12" />
        <CarouselDots className="mt-4" />
      </Carousel>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
              <CardHeader>
                  <CardTitle>Client Status</CardTitle>
                  <CardDescription>Distribution of clients by current status.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={{}} className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={dashboardMetrics.clientStatusData} layout="vertical" margin={{ left: 10, right: 10 }}>
                              <ChartTooltip
                                  content={<ChartTooltipContent hideLabel />}
                              />
                              <Bar dataKey="value" layout="vertical" radius={5}>
                                  {dashboardMetrics.clientStatusData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                              </Bar>
                         </BarChart>
                      </ResponsiveContainer>
                  </ChartContainer>
              </CardContent>
          </Card>
           <Card>
              <CardHeader>
                  <CardTitle>Projects by Status</CardTitle>
                  <CardDescription>Overview of all projects by their current status.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={{}} className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                               <ChartTooltip
                                  content={<ChartTooltipContent hideLabel />}
                              />
                              <Pie
                                  data={dashboardMetrics.projectStatusData}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  innerRadius={50}
                                  paddingAngle={5}
                                  labelLine={false}
                              >
                                {dashboardMetrics.projectStatusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                               <ChartLegend content={<ChartLegendContent />} />
                          </PieChart>
                      </ResponsiveContainer>
                  </ChartContainer>
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle>Quote Overview</CardTitle>
                  <CardDescription>Breakdown of all quotes by status.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={{}} className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                               <ChartTooltip
                                  content={<ChartTooltipContent hideLabel />}
                              />
                              <Pie
                                  data={dashboardMetrics.quoteStatusData}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  innerRadius={50}
                                  paddingAngle={5}
                                  labelLine={false}
                              >
                                {dashboardMetrics.quoteStatusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                               <ChartLegend content={<ChartLegendContent />} />
                          </PieChart>
                      </ResponsiveContainer>
                  </ChartContainer>
              </CardContent>
          </Card>
      </div>


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
