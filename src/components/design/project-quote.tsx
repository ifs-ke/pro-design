"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/cost-store";
import type { Calculations } from "@/store/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ReceiptText, Info, Milestone, Send, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { QuoteVariance } from "@/components/design/quote-variance";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFormContext } from "react-hook-form";

interface ProjectQuoteProps {
    calculations: Calculations;
}

export function ProjectQuote({ calculations }: ProjectQuoteProps) {
  const {
    publishQuote,
    loadedQuoteId,
    isPublishing,
  } = useStore();
  const { toast } = useToast();
  const form = useFormContext(); // Access the form context

  const [finalQuote, setFinalQuote] = useState<number | string>(calculations.totalPrice);

  useEffect(() => {
    setFinalQuote(calculations.totalPrice);
  }, [calculations.totalPrice]);

  const localBreakdown = useMemo((): Calculations => {
    const numericQuote = typeof finalQuote === 'string' ? parseFloat(finalQuote) : finalQuote;
    if (isNaN(numericQuote) || numericQuote < calculations.totalCost) {
        return calculations;
    }

    // This is a simplified example. In a real scenario, you'd need to
    // reverse-calculate profit, tax, etc., based on the new final price.
    // For this example, we'll just adjust the profit.
    const profitAdjustment = numericQuote - calculations.totalPrice;
    const newProfit = calculations.profitAmount + profitAdjustment;

    return {
        ...calculations,
        totalPrice: numericQuote,
        profitAmount: newProfit,
    };
  }, [finalQuote, calculations]);


  const handleQuoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFinalQuote(e.target.value);
  };

  const handleBlur = () => {
    const numericValue = parseFloat(finalQuote as string);
     if (!isNaN(numericValue) && numericValue >= calculations.totalCost) {
        setFinalQuote(numericValue);
     } else {
        setFinalQuote(calculations.totalPrice);
     }
  }

  const handlePublish = async () => {
    if (!form.getValues().clientId) {
        toast({
            variant: "destructive",
            title: "Client Required",
            description: "Please select a client before publishing.",
        });
        return;
    }

    const result = await publishQuote(localBreakdown, calculations);

    if (result) {
        toast({
            title: `Quote ${result.wasExisting ? 'Updated' : 'Published'}!`,
            description: `Quote ID ${result.quoteId} has been saved.`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "An error occurred",
            description: "Could not publish the quote. Please try again.",
        });
    }
  }

  const suggestedForVariance = {
    grandTotal: calculations.totalPrice,
    profit: calculations.profitAmount,
  };

  const finalForVariance = {
    grandTotal: localBreakdown.totalPrice,
    profit: localBreakdown.profitAmount,
  };


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
                    value={formatCurrency(calculations.totalPrice)}
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
            suggested={suggestedForVariance}
            final={finalForVariance}
        />

        <Separator />
        
        <div className="space-y-4">
          <h4 className="font-medium text-center md:text-left">Quote Breakdown</h4>
          <TooltipProvider>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><p className="text-muted-foreground">Total Base Cost</p><p className="font-medium">{formatCurrency(localBreakdown.totalCost)}</p></div>
                <div className="flex justify-between"><p className="text-muted-foreground">Profit</p><p className="font-medium">{formatCurrency(localBreakdown.profitAmount)}</p></div>
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
                    <p className="text-muted-foreground">Tax ({((form.getValues().taxRate) || 0).toFixed(2)}%)</p>
                    <p className="font-semibold">{formatCurrency(localBreakdown.taxAmount)}</p>
                </div>
                {localBreakdown.numberOfPeople && (
                    <div className="flex justify-between">
                        <p className="text-muted-foreground flex items-center">
                            <Users className="size-3 mr-1.5" />
                            Number of People
                        </p>
                        <p className="font-semibold">{localBreakdown.numberOfPeople}</p>
                    </div>
                 )}
                <Separator className="my-2"/>
                <div className="flex justify-between font-bold text-base bg-primary/10 p-2 rounded-md">
                    <p>Grand Total</p>
                    <p>{formatCurrency(localBreakdown.totalPrice)}</p>
                </div>
            </div>
          </TooltipProvider>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <Button onClick={handlePublish} className="w-full" disabled={!form.getValues().clientId || isPublishing}>
            {isPublishing ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
            {loadedQuoteId ? 'Update Quote' : 'Publish Quote'}
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
