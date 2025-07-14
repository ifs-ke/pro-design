
"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/cost-store";

import { CostForm } from "@/components/design/cost-form";
import { ProfitAllocator } from "@/components/design/profit-allocator";
import { ProjectQuote } from "@/components/design/project-quote";
import { getClients, getProjects } from "@/lib/actions";
import type { Client, Project } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default function CostingPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { resetForm } = useStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Zustand persistance hydration can cause a mismatch between the server and client render.
    // This effect ensures that the component only renders on the client, after hydration is complete.
    setIsHydrated(true);
    
    async function fetchData() {
        const [clientData, projectData] = await Promise.all([getClients(), getProjects()]);
        setClients(clientData);
        setProjects(projectData);
    }
    fetchData();

  }, []);

  const handleNewQuote = () => {
    resetForm();
  }

  if (!isHydrated) {
    // You can return a loading spinner or null here
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-lg">Loading Costing Tool...</div>
        </div>
    );
  }

  return (
    <>
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Costing Tool
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
            Your all-in-one pricing tool for interior design projects.
            </p>
        </div>
        <Button onClick={handleNewQuote} variant="outline">
            <RefreshCcw className="mr-2"/>
            Start New Quote
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-8">
          <CostForm clients={clients} projects={projects} />
        </div>

        <div className="lg:col-span-2 space-y-8 sticky top-8">
          <ProfitAllocator />
          <ProjectQuote clients={clients} />
        </div>
      </div>
    </>
  );
}
