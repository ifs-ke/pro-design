
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import { useStore } from "@/store/cost-store";
import { QuotesTable } from '@/components/design/quotes-table';

export default function QuotesPage() {
    const { quotes, projects, clients } = useStore((state) => ({
      quotes: state.quotes,
      projects: state.projects,
      clients: state.clients,
    }));
    const isLoading = !useStore((state) => state._hydrated);

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
        <Link href="/costing">
          <Button size="sm">
            <PlusCircle className="mr-2" />
            Create New Quote
          </Button>
        </Link>
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
              <QuotesTable quotes={quotes} projects={projects} clients={clients} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
