
"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/cost-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { PlusCircle, Building, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function ProjectsPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { projects, publishedQuotes } = useStore();

  useEffect(() => {
    useStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-lg">Loading Projects...</div>
        </div>
    );
  }
  
  const getProjectQuotes = (projectId: string) => {
    return publishedQuotes.filter(q => q.projectId === projectId);
  }

  const getProjectTotalValue = (projectId: string) => {
    const quotes = getProjectQuotes(projectId).filter(q => q.status === 'Approved');
    return quotes.reduce((acc, q) => acc + q.calculations.grandTotal, 0);
  }


  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage all your ongoing and completed projects.</p>
        </div>
        <Link href="/costing">
          <Button>
            <PlusCircle className="mr-2" />
            Start New Project
          </Button>
        </Link>
      </header>

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <CardHeader>
            <Building className="mx-auto size-12 text-muted-foreground mb-4" />
            <CardTitle>No Projects Yet</CardTitle>
            <CardDescription>Assign a quote to a new project to get started.</CardDescription>
            </CardHeader>
            <CardContent>
            <Link href="/quotes">
                <Button>
                Go to Quotes
                </Button>
            </Link>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => {
                const projectQuotes = getProjectQuotes(project.id);
                return (
                    <Card key={project.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="text-primary"/>
                                {project.name}
                            </CardTitle>
                            <CardDescription>
                                Created on {new Date(project.createdAt).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Approved Value</h4>
                                <p className="text-2xl font-bold">{formatCurrency(getProjectTotalValue(project.id))}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Linked Quotes ({projectQuotes.length})</h4>
                                {projectQuotes.length > 0 ? (
                                    <ul className="space-y-2">
                                        {projectQuotes.map(q => (
                                            <li key={q.id} className="text-sm flex items-center justify-between">
                                                <Link href={`/quotes/${q.id}`} className="flex items-center gap-2 hover:underline">
                                                    <FileText className="size-4 text-muted-foreground"/>
                                                    <span>{q.clientName} ({q.id})</span>
                                                </Link>
                                                <Badge variant={q.status === 'Approved' ? 'success' : 'secondary'} className="capitalize">{q.status.toLowerCase()}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No quotes assigned yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
      )}
    </div>
  );
}
