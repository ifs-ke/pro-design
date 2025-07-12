
"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/cost-store";

import { CostForm } from "@/components/design/cost-form";
import { ProfitAllocator } from "@/components/design/profit-allocator";
import { CostBreakdown } from "@/components/design/cost-breakdown";
import { ProjectQuote } from "@/components/design/project-quote";
import { MaterialSuggester } from "@/components/design/material-suggester";
import { AiQuoteAnalyst } from "@/components/design/ai-quote-analyst";

export default function DesignCostProPage() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Manually trigger hydration check on mount
    useStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null; // or a loading skeleton
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-xl mx-auto">
        <header className="mb-8 text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold text-primary tracking-tight">
            DesignCost Pro
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
      </div>
    </main>
  );
}
