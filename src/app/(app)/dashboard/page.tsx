import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Calculator, ArrowRight, Users, FileText, BarChart2, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getDashboardMetrics } from '@/lib/actions';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { BarChart, PieChart, Pie, Cell, ResponsiveContainer, Bar, YAxis, XAxis } from "recharts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots
} from "@/components/ui/carousel";

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default async function DashboardPage() {
  const dashboardMetrics = await getDashboardMetrics();

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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
              <CardHeader>
                  <CardTitle>Client Status</CardTitle>
                  <CardDescription>Distribution of clients by current status.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={{}} className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={dashboardMetrics.clientStatusData} layout="vertical" margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                              <ChartTooltip
                                  cursor={false}
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
