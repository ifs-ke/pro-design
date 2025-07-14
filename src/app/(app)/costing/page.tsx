
"use client";

import { useStore } from "@/store/cost-store";
import { useIsHydrated } from "@/hooks/use-hydrated-store";

import { CostForm } from "@/components/design/cost-form";
import { ProfitAllocator } from "@/components/design/profit-allocator";
import { ProjectQuote } from "@/components/design/project-quote";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default function CostingPage() {
  const resetForm = useStore((state) => state.resetForm);
  const isLoading = !useIsHydrated();

  const handleNewQuote = () => {
    resetForm();
  }

  if (isLoading) {
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
          <CostForm />
        </div>

        <div className="lg:col-span-2 space-y-8 sticky top-8">
          <ProfitAllocator />
          <ProjectQuote />
        </div>
      </div>
    </>
  );
}
