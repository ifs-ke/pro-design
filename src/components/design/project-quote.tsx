
"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/store/cost-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, ReceiptText, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


export function ProjectQuote() {
  const { calculations, updateProfitMarginFromFinalQuote } = useStore(state => ({
    calculations: state.calculations,
    updateProfitMarginFromFinalQuote: state.updateProfitMarginFromFinalQuote
  }));

  const { grandTotal, totalBaseCost, profit, subtotal, tax, taxRate, taxType } = calculations;

  const [finalQuote, setFinalQuote] = useState<number | string>(grandTotal);

  useEffect(() => {
    // Update the local state when the calculated grandTotal changes
    // This happens when any form field (like profit margin) is adjusted
    setFinalQuote(grandTotal);
  }, [grandTotal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFinalQuote(value); // Keep input as string while typing
  };

  const handleInputBlur = () => {
    const numericValue = parseFloat(finalQuote as string);
    if (!isNaN(numericValue) && numericValue > 0) {
      setFinalQuote(numericValue);
      updateProfitMarginFromFinalQuote(numericValue);
    } else {
      // Reset to the last valid calculation if input is invalid
      setFinalQuote(grandTotal);
    }
  };

  // For clarity:
  const grossRevenue = grandTotal; // Total amount from client

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Quote</CardTitle>
        <CardDescription>
          The final quote to be presented to the client. Adjusting this will impact the profit margin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="w-full p-4 rounded-lg bg-primary/10 flex flex-col justify-center">
              <div className="flex justify-between items-center">
                  <p className="text-sm font-medium flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Suggested Quote
                  </p>
                  <p className="text-lg font-semibold">{formatCurrency(grossRevenue)}</p>
              </div>
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
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className="bg-background/80 text-lg font-bold text-primary"
              />
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <h4 className="font-medium text-center md:text-left">Quote Breakdown</h4>
          <TooltipProvider>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><p className="text-muted-foreground">Total Base Cost</p><p className="font-medium">{formatCurrency(totalBaseCost)}</p></div>
                <div className="flex justify-between"><p className="text-muted-foreground">Profit</p><p className="font-medium">{formatCurrency(profit)}</p></div>
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
                    <p className="font-semibold">{formatCurrency(subtotal)}</p>
                </div>
                 <div className="flex justify-between">
                    <p className="text-muted-foreground">{taxType} ({taxRate}%)</p>
                    <p className="font-semibold">{formatCurrency(tax)}</p>
                </div>
                <Separator className="my-2"/>
                <div className="flex justify-between font-bold text-base">
                    <p>Grand Total</p>
                    <p>{formatCurrency(grandTotal)}</p>
                </div>
            </div>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
