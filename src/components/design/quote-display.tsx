
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Allocation } from "./profit-allocator";
import { formatCurrency } from "@/lib/utils";
import { Users, PiggyBank, Lightbulb, Heart, Info, TrendingUp, ReceiptText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


interface QuoteDisplayProps {
  calculations: {
    materialCost: number;
    laborCost: number;
    operationalCost: number;
    miscellaneousCost: number;
    totalBaseCost: number;
    profit: number;
    subtotal: number;
    tax: number;
    grandTotal: number;
    taxRate: number;
    taxType: string;
  };
  allocations: Allocation;
  onFinalQuoteChange: (finalQuote: number) => void;
}

const allocationMeta = {
  salaries: { icon: Users, label: "Salaries" },
  savings: { icon: PiggyBank, label: "Savings" },
  futureDev: { icon: Lightbulb, label: "Future Dev" },
  csr: { icon: Heart, label: "CSR" },
};


export function QuoteDisplay({ calculations, allocations, onFinalQuoteChange }: QuoteDisplayProps) {
  const {
    materialCost,
    laborCost,
    operationalCost,
    miscellaneousCost,
    totalBaseCost,
    profit,
    subtotal,
    tax,
    grandTotal,
    taxRate,
    taxType,
  } = calculations;

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
      onFinalQuoteChange(numericValue);
    } else {
      // Reset to the last valid calculation if input is invalid
      setFinalQuote(grandTotal);
    }
  };

  // For clarity:
  const netRevenue = subtotal; // Revenue before tax
  const grossRevenue = grandTotal; // Total amount from client

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Final Quote</CardTitle>
        <CardDescription>
          A complete breakdown of the final project price.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div className="space-y-2 text-sm">
            <div className="flex justify-between"><p className="text-muted-foreground">Material Cost</p><p>{formatCurrency(materialCost)}</p></div>
            <div className="flex justify-between"><p className="text-muted-foreground">Labor Cost</p><p>{formatCurrency(laborCost)}</p></div>
            <div className="flex justify-between"><p className="text-muted-foreground">Operational Cost</p><p>{formatCurrency(operationalCost)}</p></div>
            <div className="flex justify-between"><p className="text-muted-foreground">Miscellaneous (10%)</p><p>{formatCurrency(miscellaneousCost)}</p></div>
        </div>
        <Separator />
         <div className="space-y-2 text-sm">
            <div className="flex justify-between"><p className="text-muted-foreground">Total Base Cost</p><p className="font-medium">{formatCurrency(totalBaseCost)}</p></div>
            <div className="flex justify-between"><p className="text-muted-foreground">Profit</p><p className="font-medium">{formatCurrency(profit)}</p></div>
        </div>
        <Separator />
        <TooltipProvider>
            <div className="space-y-2 text-sm">
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
                    <p className="font-semibold">{formatCurrency(netRevenue)}</p>
                </div>
                <div className="flex justify-between">
                    <p className="text-muted-foreground">{taxType} ({taxRate}%)</p>
                    <p className="font-semibold">{formatCurrency(tax)}</p>
                </div>
            </div>
        </TooltipProvider>

        <Separator />
        <div>
            <h4 className="font-medium mb-2 text-sm">Profit Allocation Details</h4>
            <div className="space-y-2 text-sm">
                {Object.entries(allocations).map(([key, value]) => {
                    const meta = allocationMeta[key as keyof typeof allocationMeta];
                    const Icon = meta.icon;
                    return (
                        <div key={key} className="flex justify-between items-center text-muted-foreground">
                            <span className="flex items-center gap-2"><Icon className="size-4" />{meta.label}</span>
                            <span>{formatCurrency(profit * (value / 100))}</span>
                        </div>
                    )
                })}
            </div>
        </div>
      </CardContent>
      <CardFooter className="bg-primary/10 mt-4 p-4 rounded-b-lg flex-col items-start gap-4">
        <div className="w-full">
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
      </CardFooter>
    </Card>
  );
}
