'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MetricCardProps {
    title: string;
    value: string | number;
    description?: string;
}

function MetricCard({ title, value, description }: MetricCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    )
}

interface DashboardMetricsProps {
    totalClients: number;
    totalProjects: number;
    totalQuotes: number;
    approvalRate: number;
}

export function DashboardMetrics({ totalClients, totalProjects, totalQuotes, approvalRate }: DashboardMetricsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total Clients" value={totalClients} description="All clients in the system" />
            <MetricCard title="Total Projects" value={totalProjects} description="All projects, active and inactive" />
            <MetricCard title="Total Quotes" value={totalQuotes} description="All quotes created" />
            <MetricCard title="Approval Rate" value={`${approvalRate.toFixed(2)}%`} description="Of all non-draft quotes" />
        </div>
    )
}
