
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, ReceiptText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


interface ProjectQuoteProps {
  calculations: {
    grandTotal: number;
  };
  onFinalQuoteChange: (finalQuote: number) => void;
}

export function ProjectQuote({ calculations, onFinalQuoteChange }: ProjectQuoteProps) {
  const { grandTotal } = calculations;

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
  const grossRevenue = grandTotal; // Total amount from client

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Quote</CardTitle>
        <CardDescription>
          The final quote to be presented to the client. Adjusting this will impact the profit margin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full p-4 rounded-lg bg-primary/10">
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
      </CardContent>
    </Card>
  );
}
