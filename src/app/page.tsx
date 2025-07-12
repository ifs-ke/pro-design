"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { useState, useMemo, useEffect } from "react";

import { CostForm, formSchema } from "@/components/design/cost-form";
import { ProfitAllocator } from "@/components/design/profit-allocator";
import type { Allocation } from "@/components/design/profit-allocator";
import { QuoteDisplay } from "@/components/design/quote-display";
import { MaterialSuggester } from "@/components/design/material-suggester";

export default function DesignCostProPage() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materials: [{ name: "Initial Material", cost: 10000 }],
      labor: [{ vendor: "Main Vendor", hours: 80, rate: 50 }],
      operations: [{ name: "Initial Operation Cost", cost: 2000 }],
      taxRate: 15,
      profitMargin: 25,
    },
  });

  const [allocations, setAllocations] = useState<Allocation>({
    salaries: 40,
    savings: 20,
    futureDev: 20,
    csr: 20,
  });

  const watchedValues = form.watch();

  const calculations = useMemo(() => {
    const {
      materials,
      labor,
      operations,
      taxRate,
      profitMargin,
    } = watchedValues;

    const materialCost = materials?.reduce((acc, item) => acc + (item.cost || 0), 0) ?? 0;
    const laborCost = labor?.reduce((acc, item) => acc + ((item.hours || 0) * (item.rate || 0)), 0) ?? 0;
    const operationalCost = operations?.reduce((acc, item) => acc + (item.cost || 0), 0) ?? 0;
    
    const baseCost = materialCost + laborCost + operationalCost;
    const miscellaneousCost = baseCost * 0.10;
    const totalBaseCost = baseCost + miscellaneousCost;
    const profit = totalBaseCost * ((profitMargin || 0) / 100);
    const subtotal = totalBaseCost + profit;
    const tax = subtotal * ((taxRate || 0) / 100);
    const grandTotal = subtotal + tax;

    return {
      materialCost,
      laborCost,
      operationalCost,
      miscellaneousCost,
      totalBaseCost,
      profit,
      subtotal,
      tax,
      grandTotal,
    };
  }, [watchedValues]);

  if (!isClient) {
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
            <CostForm form={form} />
            <div className="grid md:grid-cols-2 gap-8">
              <ProfitAllocator
                allocations={allocations}
                setAllocations={setAllocations}
                profit={calculations.profit}
              />
              <QuoteDisplay
                calculations={calculations}
                allocations={allocations}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <MaterialSuggester />
          </div>
        </div>
      </div>
    </main>
  );
}
