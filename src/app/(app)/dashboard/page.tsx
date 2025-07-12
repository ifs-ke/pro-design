
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Calculator } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here&apos;s a quick overview of your projects.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
            <CardDescription>Number of quotes generated</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Quoted Value</CardTitle>
            <CardDescription>Sum of all project quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">KES 2,450,000</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Profit Margin</CardTitle>
            <CardDescription>Across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">28%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center bg-primary/5">
        <CardHeader>
          <Calculator className="mx-auto size-12 text-primary mb-4" />
          <CardTitle>Ready to Start a New Project?</CardTitle>
          <CardDescription>Create a detailed cost analysis and generate a professional quote in minutes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/costing">
            <Button size="lg">
              Go to Costing Tool
            </Button>
          </Link>
        </CardContent>
      </Card>

    </div>
  );
}
