
"use client";

import { useState } from "react";
import { useStore } from "@/store/cost-store";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lightbulb, BarChart, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getQuoteInsights, type QuoteInsightsInput, type QuoteInsightsOutput } from "@/ai/flows/quote-insights-flow";

export function AiQuoteAnalyst() {
  const calculations = useStore(state => state.calculations);

  const [analysis, setAnalysis] = useState<QuoteInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyzeQuote = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const input: QuoteInsightsInput = {
        totalBaseCost: calculations.totalBaseCost,
        profit: calculations.profit,
        profitMargin: calculations.profitMargin,
        grandTotal: calculations.grandTotal,
        businessType: calculations.businessType,
    }

    try {
      const result = await getQuoteInsights(input);
      setAnalysis(result);
    } catch (e) {
      setError("Failed to get analysis. Please try again.");
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Could not fetch AI quote analysis.",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
        <Button onClick={handleAnalyzeQuote} disabled={isLoading || calculations.grandTotal === 0} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Analyze My Quote
        </Button>

        <div className="mt-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Consulting with the business expert...</p>
            </div>
          )}
          {error && <Alert variant="destructive">{error}</Alert>}
          {analysis && (
            <div className="space-y-4">
                <Alert>
                    <BarChart className="h-4 w-4" />
                    <AlertTitle>Quote Insight</AlertTitle>
                    <AlertDescription>{analysis.quoteInsight}</AlertDescription>
                </Alert>
                <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Business Strategy</AlertTitle>
                    <AlertDescription>{analysis.businessStrategy}</AlertDescription>
                </Alert>
            </div>
          )}
        </div>
    </div>
  );
}
