
"use client";

import { useState } from "react";
import type { Calculations } from "@/store/cost-store";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lightbulb, BarChart, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getQuoteInsights, type QuoteInsightsInput, type QuoteInsightsOutput } from "@/ai/flows/quote-insights-flow";
import { motion, AnimatePresence } from "framer-motion";

interface AiQuoteAnalystProps {
    calculations: Calculations;
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
    
    if (!calculations) {
        setError("Calculations are not available.");
        setIsLoading(false);
        return;
    }

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
        <Button onClick={handleAnalyzeQuote} disabled={isLoading || !calculations || calculations.grandTotal === 0} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Analyze My Quote
        </Button>

        <div className="mt-4 min-h-[180px]">
           <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-muted-foreground p-8"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p>Consulting with the business expert...</p>
                </motion.div>
              )}
              {error && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Alert variant="destructive">{error}</Alert>
                </motion.div>
              )}
              {analysis && (
                <motion.div 
                    key="analysis" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                >
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
                </motion.div>
              )}
           </AnimatePresence>
        </div>
    </div>
  );
}
