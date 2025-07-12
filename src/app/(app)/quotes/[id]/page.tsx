
"use client";

import { useStore } from "@/store/cost-store";
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CostBreakdown } from "@/components/design/quote-display";
import { MaterialsList } from "@/components/design/materials-list";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { publishedQuotes, clients } = useStore();

  const quote = publishedQuotes.find(q => q.id === params.id);
  const client = quote ? clients.find(c => c.id === quote.clientId) : null;

  if (!quote) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Quote not found</h1>
        <p className="text-muted-foreground">This quote may have been deleted.</p>
        <Button onClick={() => router.push('/quotes')} className="mt-4">Go to Quotes</Button>
      </div>
    );
  }

  const materials = quote.formValues.materials || [];
  const clientName = client ? client.name : "Unknown Client";

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2" />
          Back to Quotes
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
                <p className="text-4xl font-bold text-primary">{formatCurrency(quote.calculations.grandTotal)}</p>
            </div>
        </div>
      </header>
      
      <div className="grid md:grid-cols-1 gap-8 items-start">
        <CostBreakdown 
            calculations={quote.calculations} 
            allocations={quote.allocations} 
            suggestedCalculations={quote.suggestedCalculations}
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
