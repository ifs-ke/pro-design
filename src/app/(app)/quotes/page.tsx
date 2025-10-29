
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Download } from "lucide-react";
import { useStore, type HydratedQuote } from "@/store/cost-store";
import { useIsHydrated } from "@/hooks/use-hydrated-store";
import { QuotesTable } from '@/components/design/quotes-table';

function downloadCSV(data: HydratedQuote[], filename: string) {
  const headers = ['Quote ID', 'Client Name', 'Project Name', 'Date', 'Status', 'Grand Total'];
  const rows = data.map(q => [
    q.id,
    `"${q.client?.name || 'N/A'}"`,
    `"${q.project?.name || 'N/A'}"`,
    new Date(q.timestamp).toLocaleDateString(),
    q.status,
    (q.calculations as any).grandTotal
  ].join(','));

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


export default function QuotesPage() {
  const { quotes, projects, clients, hydratedQuotes } = useStore();
  const isLoading = !useIsHydrated();

  const handleExport = () => {
    downloadCSV(hydratedQuotes, `quotes-export-${new Date().toISOString().split('T')[0]}.csv`);
  }

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-lg">Loading Quotes...</div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground mt-1">Manage all your client quotes in one place.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} disabled={quotes.length === 0}>
                <Download className="mr-2" />
                Export to CSV
            </Button>
            <Link href="/costing">
              <Button size="sm">
                <PlusCircle className="mr-2" />
                Create New Quote
              </Button>
            </Link>
        </div>
      </header>

      {quotes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <CardHeader>
            <FileText className="mx-auto size-12 text-muted-foreground mb-4" />
            <CardTitle>No Quotes Yet</CardTitle>
            <CardDescription>Click "Create New Quote" to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/costing">
              <Button>
                <PlusCircle className="mr-2" />
                Create New Quote
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <QuotesTable quotes={hydratedQuotes} projects={projects} clients={clients} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
