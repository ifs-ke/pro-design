
"use client";

import { useStore } from "@/store/cost-store";
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { CostBreakdown } from "@/components/design/quote-display";
import { formatCurrency } from "@/lib/utils";

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { publishedQuotes } = useStore();

  const quote = publishedQuotes.find(q => q.id === params.id);

  if (!quote) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Quote not found</h1>
        <p className="text-muted-foreground">This quote may have been deleted.</p>
        <Button onClick={() => router.push('/quotes')} className="mt-4">Go to Quotes</Button>
      </div>
    );
  }

  const handleEdit = () => {
    // This is a placeholder for future edit functionality.
    // A more complete implementation might load this quote back into the costing tool.
    router.push('/costing');
  }

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
                <h1 className="text-4xl font-bold tracking-tight">{quote.clientName}</h1>
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
        <CostBreakdown calculations={quote.calculations} allocations={quote.allocations} />
      </div>

    </div>
  );
}
