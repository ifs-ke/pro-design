
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
import { ReceiptText, Info, Milestone, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AiQuoteAnalyst } from "@/components/design/ai-quote-analyst";
import { QuoteVariance } from "@/components/design/quote-variance";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";


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
  const { calculations: globalCalculations, formValues, publishQuote } = useStore(state => ({
    calculations: state.calculations,
    formValues: state.formValues,
    publishQuote: state.publishQuote,
  }));
  const { toast } = useToast();

  const [finalQuote, setFinalQuote] = useState<number | string>(globalCalculations.grandTotal);
  
  useEffect(() => {
    // Only update the final quote from global calculations if it's not being manually edited
    // or if the base costs have changed, making the old manual quote potentially invalid.
    if (globalCalculations.grandTotal !== parseFloat(finalQuote.toString())) {
       setFinalQuote(globalCalculations.grandTotal);
    }
  }, [globalCalculations.grandTotal, globalCalculations.totalBaseCost]);

  const localBreakdown = useMemo((): QuoteBreakdown => {
    const numericQuote = typeof finalQuote === 'string' ? parseFloat(finalQuote) : finalQuote;

    if (isNaN(numericQuote) || numericQuote < globalCalculations.totalBaseCost) {
        return globalCalculations;
    }

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
        newSubtotal = numericQuote / (1 + (newTaxRate / 100)); // Incorrect for TOT, but let's follow a consistent pattern
        newSubtotal = numericQuote * (1 - (newTaxRate/100));
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
    setFinalQuote(e.target.value); 
  };

  const handleBlur = () => {
    const numericValue = parseFloat(finalQuote as string);
     if (!isNaN(numericValue) && numericValue >= globalCalculations.totalBaseCost) {
        setFinalQuote(numericValue);
     } else {
        setFinalQuote(globalCalculations.grandTotal);
     }
  }

  const handlePublish = () => {
    if (!formValues.clientName) {
        toast({
            variant: "destructive",
            title: "Client Name Required",
            description: "Please enter a client name before publishing.",
        });
        return;
    }
    const newQuoteId = publishQuote();
    toast({
        title: "Quote Published!",
        description: `Quote ID ${newQuoteId} has been saved.`,
    });
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Final Project Quote</CardTitle>
        <CardDescription>
          Adjust the final quote and publish when you're ready.
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
        
        <div className="space-y-2">
          <AiQuoteAnalyst />
          <Button onClick={handlePublish} className="w-full">
            <Send className="mr-2" />
            Publish Quote
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
