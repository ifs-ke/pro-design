
"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/cost-store";

import { CostForm } from "@/components/design/cost-form";
import { ProfitAllocator } from "@/components/design/profit-allocator";
import { CostBreakdown } from "@/components/design/cost-breakdown";
import { ProjectQuote } from "@/components/design/project-quote";
import { MaterialSuggester } from "@/components/design/material-suggester";
import { AiQuoteAnalyst } from "@/components/design/ai-quote-analyst";

export default function CostingPage() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Manually trigger hydration check on mount
    useStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-lg">Loading Costing Tool...</div>
        </div>
    );
  }

  return (
    <>
      <header className="mb-8 text-center lg:text-left">
        <h1 className="text-4xl lg:text-5xl font-bold text-primary tracking-tight">
          Costing Tool
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Your all-in-one pricing tool for interior design projects.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <CostForm />
          <div className="grid md:grid-cols-2 gap-8">
            <CostBreakdown />
            <ProfitAllocator />
          </div>
           <ProjectQuote />
        </div>

        <div className="lg:col-span-1 space-y-8">
          <MaterialSuggester />
          <AiQuoteAnalyst />
        </div>
      </div>
    </>
  );
}
