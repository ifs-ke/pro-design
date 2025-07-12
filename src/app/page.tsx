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
      materialCost: 10000,
      laborHours: 80,
      laborRate: 50,
      operationalCost: 2000,
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
      materialCost,
      laborHours,
      laborRate,
      operationalCost,
      taxRate,
      profitMargin,
    } = watchedValues;
    const laborCost = (laborHours || 0) * (laborRate || 0);
    const totalBaseCost =
      (materialCost || 0) + laborCost + (operationalCost || 0);
    const profit = totalBaseCost * ((profitMargin || 0) / 100);
    const subtotal = totalBaseCost + profit;
    const tax = subtotal * ((taxRate || 0) / 100);
    const grandTotal = subtotal + tax;

    return {
      materialCost: materialCost || 0,
      laborCost,
      operationalCost: operationalCost || 0,
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
