
"use client";

import { useState } from "react";
import { useStore, type Calculations } from "@/store/cost-store";
import { useIsHydrated } from "@/hooks/use-hydrated-store";

import { CostForm } from "@/components/design/cost-form";
import { ProfitAllocator } from "@/components/design/profit-allocator";
import { ProjectQuote } from "@/components/design/project-quote";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

const initialCalculations: Calculations = {
    materialCost: 0,
    laborCost: 0,
    operationalCost: 0,
    affiliateCost: 0,
    miscCost: 0,
    salaryCost: 0,
    totalBaseCost: 0,
    profit: 0,
    subtotal: 0,
    grandTotal: 0,
    tax: 0,
    taxRate: 0,
    taxType: 'VAT',
    profitMargin: 0,
    businessType: 'vat_registered',
};

export default function CostingPage() {
  const resetForm = useStore((state) => state.resetForm);
  const setCalculationsInStore = useStore((state) => state.setCalculations);
  const isLoading = !useIsHydrated();
  
  const [calculations, setCalculations] = useState<Calculations>(initialCalculations);

  const handleNewQuote = () => {
    resetForm();
    setCalculations(initialCalculations);
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
          <CostForm onCalculationsChange={(newCalculations) => {
            setCalculations(newCalculations);
            setCalculationsInStore(newCalculations);
          }} />
        </div>

        <div className="lg:col-span-2 space-y-8 sticky top-8">
          <ProfitAllocator profit={calculations.profit} />
          <ProjectQuote calculations={calculations} />
        </div>
      </div>
    </>
  );
}
