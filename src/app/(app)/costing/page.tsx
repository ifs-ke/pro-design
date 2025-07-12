
"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/cost-store";

import { CostForm } from "@/components/design/cost-form";
import { ProfitAllocator } from "@/components/design/profit-allocator";
import { ProjectQuote } from "@/components/design/project-quote";

export default function CostingPage() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Zustand persistance hydration can cause a mismatch between the server and client render.
    // This effect ensures that the component only renders on the client, after hydration is complete.
    useStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

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
      <header className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
          Costing Tool
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Your all-in-one pricing tool for interior design projects.
        </p>
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
