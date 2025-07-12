
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Allocation, Calculations } from "@/store/cost-store";
import { formatCurrency } from "@/lib/utils";
import { PiggyBank, Lightbulb, Heart, Info, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuoteVariance } from "./quote-variance";


interface CostBreakdownProps {
  calculations: Calculations;
  allocations: Allocation;
  suggestedCalculations?: Calculations;
}

const allocationMeta = {
  savings: { icon: PiggyBank, label: "Savings" },
  futureDev: { icon: Lightbulb, label: "Future Dev" },
  csr: { icon: Heart, label: "CSR" },
};


export function CostBreakdown({ calculations, allocations, suggestedCalculations }: CostBreakdownProps) {
  const {
    materialCost,
    laborCost,
    operationalCost,
    totalBaseCost,
    profit,
    subtotal,
    tax,
    grandTotal,
    taxRate,
    taxType,
    salaryCost,
    numberOfPeople
  } = calculations;

  // For clarity:
  const netRevenue = subtotal; // Revenue before tax

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Quote Breakdown</CardTitle>
        <CardDescription>
          A detailed breakdown of the project costs and totals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        {suggestedCalculations && (
            <>
                <QuoteVariance suggested={suggestedCalculations} final={calculations} />
                <Separator />
            </>
        )}
        <div className="space-y-2 text-sm">
            <div className="flex justify-between"><p className="text-muted-foreground">Material Cost</p><p>{formatCurrency(materialCost)}</p></div>
            <div className="flex justify-between"><p className="text-muted-foreground">Labor Cost</p><p>{formatCurrency(laborCost)}</p></div>
            <div className="flex justify-between"><p className="text-muted-foreground">Operational Cost</p><p>{formatCurrency(operationalCost)}</p></div>
             <div className="flex justify-between">
                <p className="text-muted-foreground flex items-center">
                    <Users className="size-3 mr-1.5" />
                    Salaries {numberOfPeople ? `(for ${numberOfPeople})` : ''}
                </p>
                <p>{formatCurrency(salaryCost)}</p>
            </div>
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
        <div className="flex justify-between font-bold text-base bg-primary/10 p-2 rounded-md">
            <p>Grand Total</p>
            <p>{formatCurrency(grandTotal)}</p>
        </div>

      </CardContent>
       <CardFooter className="bg-muted/10 mt-4 p-4 rounded-b-lg flex-col items-start gap-2 border-t">
            <h4 className="font-medium mb-2 text-sm">Profit Allocation Details</h4>
            <div className="space-y-2 text-sm w-full">
                {Object.entries(allocations).map(([key, value]) => {
                    const meta = allocationMeta[key as keyof typeof allocationMeta];
                    if (!meta) return null;
                    const Icon = meta.icon;
                    return (
                        <div key={key} className="flex justify-between items-center text-muted-foreground">
                            <span className="flex items-center gap-2"><Icon className="size-4" />{meta.label}</span>
                            <span>{formatCurrency(profit * (value / 100))}</span>
                        </div>
                    )
                })}
            </div>
      </CardFooter>
    </Card>
  );
}
