
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lightbulb, BarChart, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getQuoteInsights, type QuoteInsightsInput, type QuoteInsightsOutput } from "@/ai/flows/quote-insights-flow";

interface AiQuoteAnalystProps {
  calculations: {
    totalBaseCost: number;
    profit: number;
    profitMargin: number;
    grandTotal: number;
    businessType: string;
  };
}

export function AiQuoteAnalyst({ calculations }: AiQuoteAnalystProps) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-primary" />
          AI Quote Analyst
        </CardTitle>
        <CardDescription>
          Get AI-powered insights and business strategies based on your final quote.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleAnalyzeQuote} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Analyze My Quote
        </Button>

        <div className="mt-6">
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
      </CardContent>
    </Card>
  );
}
