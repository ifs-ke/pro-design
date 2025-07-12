
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Calculator, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome Back!</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s a quick overview of your business.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">12</p>
            <p className="text-xs text-muted-foreground mt-1">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Total Quoted Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">KES 2.45M</p>
            <p className="text-xs text-muted-foreground mt-1">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Average Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">28%</p>
            <p className="text-xs text-muted-foreground mt-1">Holding steady</p>
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
