
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/cost-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ReceiptText, Info, Milestone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AiQuoteAnalyst } from "@/components/design/ai-quote-analyst";
import { QuoteVariance } from "@/components/design/quote-variance";

interface QuoteBreakdown {
    grandTotal: number;
    totalBaseCost: number;
    profit: number;
    subtotal: number;
    tax: number;
    taxRate: number;
    taxType: string;
}

export function ProjectQuote() {
  const { calculations: globalCalculations, formValues } = useStore(state => ({
    calculations: state.calculations,
    formValues: state.formValues,
  }));

  // Local state for the final quote input. Default to the globally calculated total.
  const [finalQuote, setFinalQuote] = useState<number | string>(globalCalculations.grandTotal);
  
  // Effect to update the local finalQuote ONLY when the global grandTotal changes.
  // This syncs the input when the form is updated, but preserves manual edits otherwise.
  useEffect(() => {
    // Only reset the local quote if the base costs have changed.
    // This preserves manual adjustments if only profit margin or tax rates change.
    setFinalQuote(globalCalculations.grandTotal);
  }, [globalCalculations.grandTotal]);

  const localBreakdown = useMemo((): QuoteBreakdown => {
    const numericQuote = typeof finalQuote === 'string' ? parseFloat(finalQuote) : finalQuote;

    // If the input is not a valid number or is less than the base cost, show the global calculations.
    if (isNaN(numericQuote) || numericQuote < globalCalculations.totalBaseCost) {
        return globalCalculations;
    }

    // Recalculate the breakdown locally based on the new final quote.
    const { totalBaseCost } = globalCalculations;
    const { businessType, taxRate: vatRate } = formValues;

    let newSubtotal: number;
    let newTax: number;
    let newTaxType: string;
    let newTaxRate = vatRate || 0;

    if (businessType === 'vat_registered') {
        newTaxType = 'VAT';
        newSubtotal = numericQuote / (1 + (newTaxRate / 100));
        newTax = numericQuote - newSubtotal;
    } else { // sole_proprietor
        newTaxType = 'TOT';
        newTaxRate = 3;
        // The final quote is the gross revenue. TOT is 3% of this.
        // Net = Gross * (1 - 0.03)
        newSubtotal = numericQuote * (1 - (newTaxRate / 100));
        newTax = numericQuote - newSubtotal;
    }
    
    const newProfit = newSubtotal - totalBaseCost;

    return {
        grandTotal: numericQuote,
        totalBaseCost: totalBaseCost,
        profit: newProfit,
        subtotal: newSubtotal,
        tax: newTax,
        taxRate: newTaxRate,
        taxType: newTaxType,
    };
  }, [finalQuote, globalCalculations, formValues]);


  const handleQuoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep input as string while typing for better UX (e.g., allowing trailing decimals)
    setFinalQuote(e.target.value); 
  };

  const handleBlur = () => {
    // On blur, format the number or reset to the last valid state if invalid.
    const numericValue = parseFloat(finalQuote as string);
     if (!isNaN(numericValue) && numericValue >= globalCalculations.totalBaseCost) {
        setFinalQuote(numericValue);
     } else {
        setFinalQuote(globalCalculations.grandTotal);
     }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Final Project Quote</CardTitle>
        <CardDescription>
          Adjust the final quote to see a real-time breakdown. This will not change your base costs or profit margin settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <div className="w-full space-y-2">
                <Label htmlFor="suggested-quote" className="flex items-center text-muted-foreground">
                    <Milestone className="mr-2 h-4 w-4" />
                    Suggested Quote (from calculator)
                </Label>
                <Input
                    id="suggested-quote"
                    type="text"
                    readOnly
                    value={formatCurrency(globalCalculations.grandTotal)}
                    className="bg-muted/50 border-dashed font-semibold"
                />
            </div>
            <div className="w-full space-y-2">
                <Label htmlFor="final-quote" className="flex items-center">
                    <ReceiptText className="mr-2 h-4 w-4" />
                    Final Client Quote (Ksh)
                </Label>
                <Input
                    id="final-quote"
                    type="number"
                    placeholder="Enter final quote"
                    value={typeof finalQuote === 'number' ? finalQuote.toFixed(0) : finalQuote}
                    onChange={handleQuoteChange}
                    onBlur={handleBlur}
                    className="bg-background/80 text-lg font-bold text-primary"
                />
            </div>
        </div>
        
        <QuoteVariance
            suggested={globalCalculations}
            final={localBreakdown}
        />

        <Separator />
        
        <div className="space-y-4">
          <h4 className="font-medium text-center md:text-left">Quote Breakdown</h4>
          <TooltipProvider>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><p className="text-muted-foreground">Total Base Cost</p><p className="font-medium">{formatCurrency(localBreakdown.totalBaseCost)}</p></div>
                <div className="flex justify-between"><p className="text-muted-foreground">Profit</p><p className="font-medium">{formatCurrency(localBreakdown.profit)}</p></div>
                <Separator className="my-2"/>
                <div className="flex justify-between">
                    <p className="text-muted-foreground flex items-center">
                        Net Revenue
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="size-3 ml-1.5" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Total before tax (Base Cost + Profit)</p>
                            </TooltipContent>
                        </Tooltip>
                    </p>
                    <p className="font-semibold">{formatCurrency(localBreakdown.subtotal)}</p>
                </div>
                 <div className="flex justify-between">
                    <p className="text-muted-foreground">{localBreakdown.taxType} ({localBreakdown.taxRate.toFixed(2)}%)</p>
                    <p className="font-semibold">{formatCurrency(localBreakdown.tax)}</p>
                </div>
                <Separator className="my-2"/>
                <div className="flex justify-between font-bold text-base bg-primary/10 p-2 rounded-md">
                    <p>Grand Total</p>
                    <p>{formatCurrency(localBreakdown.grandTotal)}</p>
                </div>
            </div>
          </TooltipProvider>
        </div>
        
        <Separator />

        <AiQuoteAnalyst />

      </CardContent>
    </Card>
  );
}
