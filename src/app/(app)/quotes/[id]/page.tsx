
'use client';

import { useEffect, useState } from 'react';
import { useHydratedStore } from "@/hooks/use-hydrated-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CostBreakdown } from "@/components/design/quote-display";
import { MaterialsList } from "@/components/design/materials-list";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import type { Calculations, Allocation, FormValues } from "@/store/cost-store";

export default function QuoteDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { quote, isLoading } = useHydratedStore(state => ({
      quote: state.quotes.find(q => q.id === id),
      isLoading: !state._hydrated,
  }));
  
  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-lg">Loading Quote...</div>
        </div>
    );
  }
  
  if (!quote) {
    notFound();
  }

  const calculations = quote.calculations as Calculations;
  const suggestedCalculations = quote.suggestedCalculations as Calculations;
  const allocations = quote.allocations as Allocation;
  const formValues = quote.formValues as FormValues;

  const materials = formValues.materials || [];
  const clientName = quote.client ? quote.client.name : "Unknown Client";

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/quotes">
            <ArrowLeft className="mr-2" />
            Back to Quotes
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <p className="text-muted-foreground">Quote ID: {quote.id}</p>
                <h1 className="text-4xl font-bold tracking-tight">{clientName}</h1>
                <p className="text-muted-foreground mt-1">
                    Published on {new Date(quote.timestamp).toLocaleDateString()}
                </p>
            </div>
            <div className="text-right">
                <p className="text-muted-foreground">Grand Total</p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(calculations.grandTotal)}</p>
            </div>
        </div>
      </header>
      
      <div className="grid md:grid-cols-1 gap-8 items-start">
        <CostBreakdown 
            calculations={calculations} 
            allocations={allocations} 
            suggestedCalculations={suggestedCalculations}
        />
        {materials.length > 0 && (
          <>
            <Separator />
            <MaterialsList materials={materials} />
          </>
        )}
      </div>

    </div>
  );
}
