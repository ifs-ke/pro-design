
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { useState, useMemo, useEffect } from "react";

import { CostForm, formSchema } from "@/components/design/cost-form";
import { ProfitAllocator } from "@/components/design/profit-allocator";
import type { Allocation } from "@/components/design/profit-allocator";
import { CostBreakdown } from "@/components/design/cost-breakdown";
import { ProjectQuote } from "@/components/design/project-quote";
import { MaterialSuggester } from "@/components/design/material-suggester";
import { AiQuoteAnalyst } from "@/components/design/ai-quote-analyst";

export default function DesignCostProPage() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materials: [{ name: "Initial Material", cost: 10000 }],
      labor: [{ vendor: "Main Vendor", units: 80, rate: 50, rateType: 'hourly' }],
      operations: [{ name: "Initial Operation Cost", cost: 2000 }],
      businessType: "vat_registered",
      taxRate: 16,
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
      businessType,
    } = watchedValues;

    const materialCost = materials?.reduce((acc, item) => acc + (item.cost || 0), 0) ?? 0;
    const laborCost = labor?.reduce((acc, item) => acc + ((item.units || 0) * (item.rate || 0)), 0) ?? 0;
    const operationalCost = operations?.reduce((acc, item) => acc + (item.cost || 0), 0) ?? 0;
    
    const baseCost = materialCost + laborCost + operationalCost;
    const miscellaneousCost = baseCost * 0.10;
    const totalBaseCost = baseCost + miscellaneousCost;
    const profit = totalBaseCost * ((profitMargin || 0) / 100);
    const subtotal = totalBaseCost + profit; // This is Net Revenue

    let tax = 0;
    let grandTotal = 0;
    let effectiveTaxRate = taxRate || 0;
    let taxType = "VAT";

    if (businessType === 'vat_registered') {
        tax = subtotal * (effectiveTaxRate / 100);
        grandTotal = subtotal + tax;
    } else { // sole_proprietor
        taxType = "TOT";
        effectiveTaxRate = 3;
        // TOT is calculated on gross sales. So we need to solve for grandTotal where grandTotal = subtotal + 0.03 * grandTotal
        // grandTotal (1 - 0.03) = subtotal  => grandTotal = subtotal / 0.97
        grandTotal = subtotal / (1 - (effectiveTaxRate / 100));
        tax = grandTotal - subtotal;
    }
    

    return {
      materialCost,
      laborCost,
      operationalCost,
      miscellaneousCost,
      totalBaseCost,
      profit,
      subtotal,
      grandTotal,
      tax,
      taxRate: effectiveTaxRate,
      taxType,
      profitMargin: profitMargin || 0,
      businessType,
    };
  }, [watchedValues]);

  const handleFinalQuoteChange = (finalQuote: number) => {
    const { totalBaseCost, taxRate, businessType } = calculations;

    let subtotal;
    if (businessType === 'vat_registered') {
      subtotal = finalQuote / (1 + (taxRate / 100));
    } else { // sole_proprietor
      const effectiveTaxRate = 3;
      subtotal = finalQuote * (1 - (effectiveTaxRate / 100));
    }

    const newProfit = subtotal - totalBaseCost;
    
    let newProfitMargin = 0;
    if (totalBaseCost > 0) {
      newProfitMargin = (newProfit / totalBaseCost) * 100;
    }

    if (newProfitMargin >= 0) {
      form.setValue('profitMargin', parseFloat(newProfitMargin.toFixed(2)), { shouldValidate: true });
    }
  };


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
              <CostBreakdown
                calculations={calculations}
                allocations={allocations}
              />
              <ProfitAllocator
                allocations={allocations}
                setAllocations={setAllocations}
                profit={calculations.profit}
              />
            </div>
             <ProjectQuote 
                calculations={calculations}
                onFinalQuoteChange={handleFinalQuoteChange}
             />
          </div>

          <div className="lg:col-span-1 space-y-8">
            <MaterialSuggester />
            <AiQuoteAnalyst calculations={calculations} />
          </div>
        </div>
      </div>
    </main>
  );
}
