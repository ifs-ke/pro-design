
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { PlusCircle, Building } from "lucide-react";

export default function ProjectsPage() {
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

      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
        <CardHeader>
          <Building className="mx-auto size-12 text-muted-foreground mb-4" />
          <CardTitle>No Projects Yet</CardTitle>
          <CardDescription>Get started by creating your first project cost analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/costing">
            <Button>
              Go to Costing Tool
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
