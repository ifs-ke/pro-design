
'use client';

import { useStore } from "@/store/cost-store";
import { useIsHydrated } from "@/hooks/use-hydrated-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Calculator, ArrowRight, Users, FileText, BarChart2, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots
} from "@/components/ui/carousel";
import { DashboardCharts } from "@/components/design/dashboard-charts";


export default function DashboardPage() {
  const { dashboardMetrics } = useStore((state) => state.getHydratedData());
  const isLoading = !useIsHydrated();


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
        <p className="text-muted-foreground mt-1">Here&apos;s a quick overview of your business.</p>
      </header>
        
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
           <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
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
           <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
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
           <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quote Approval Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardMetrics.approvalRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">{dashboardMetrics.totalApprovedQuotes} of {dashboardMetrics.totalQuotes} quotes</p>
                </CardContent>
              </Card>
           </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-4" />
        <CarouselNext className="hidden sm:flex -right-4" />
        <CarouselDots className="mt-4" />
      </Carousel>
      
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
