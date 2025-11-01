
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
import { PiggyBank, Lightbulb, Heart, Info, Users, ShieldCheck } from "lucide-react";
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
  formValues: any;
}

const allocationMeta = {
  savings: { icon: PiggyBank, label: "Savings" },
  futureDev: { icon: Lightbulb, label: "Future Dev" },
  csr: { icon: Heart, label: "CSR" },
};


export function CostBreakdown({ calculations, allocations, suggestedCalculations, formValues }: CostBreakdownProps) {
  const {
    totalMaterialCost,
    totalLaborCost,
    totalOperationCost,
    totalAffiliateCost,
    subtotal,
    miscAmount,
    subtotalWithMisc,
    taxAmount,
    totalCost,
    profitAmount,
    totalPrice,
    salaryAmount,
    nssfAmount,
    shifAmount,
  } = calculations;

  const taxRate = formValues.taxRate;
  const businessType = formValues.businessType;
  
  const taxType = businessType === 'vat_registered' 
    ? "VAT"
    : businessType === 'sole_proprietor'
    ? "Turnover Tax"
    : "No Tax";


  const hasDeductibles = (nssfAmount || 0) > 0 || (shifAmount || 0) > 0;
  const directCosts = totalMaterialCost + totalLaborCost + totalOperationCost + totalAffiliateCost;

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
            <div className="flex justify-between"><p className="text-muted-foreground">Material Cost</p><p>{formatCurrency(totalMaterialCost)}</p></div>
            <div className="flex justify-between"><p className="text-muted-foreground">Labor Cost</p><p>{formatCurrency(totalLaborCost)}</p></div>
            <div className="flex justify-between"><p className="text-muted-foreground">Operational Cost</p><p>{formatCurrency(totalOperationCost)}</p></div>
             <div className="flex justify-between"><p className="text-muted-foreground">Affiliate Cost</p><p>{formatCurrency(totalAffiliateCost)}</p></div>
             <div className="flex justify-between"><p className="text-muted-foreground">Salary Cost</p><p>{formatCurrency(salaryAmount)}</p></div>
             {hasDeductibles && (
                <div className="pl-4 mt-1 space-y-1 text-xs border-l">
                    <div className="flex justify-between"><p className="text-muted-foreground">NSSF (Tier 1)</p><p>{formatCurrency(nssfAmount)}</p></div>
                    <div className="flex justify-between"><p className="text-muted-foreground">SHIF</p><p>{formatCurrency(shifAmount)}</p></div>
                </div>
            )}
        </div>
        <Separator />
         <div className="space-y-2 text-sm">
            <div className="flex justify-between"><p className="text-muted-foreground">Direct Costs Subtotal</p><p className="font-medium">{formatCurrency(directCosts)}</p></div>
            <div className="flex justify-between"><p className="text-muted-foreground">Salaries & Deductibles</p><p className="font-medium">{formatCurrency(salaryAmount)}</p></div>
            <div className="flex justify-between"><p className="text-muted-foreground">Subtotal</p><p className="font-semibold">{formatCurrency(subtotal)}</p></div>
            <div className="flex justify-between"><p className="text-muted-foreground">Misc / Contingency</p><p className="font-medium">{formatCurrency(miscAmount)}</p></div>
        </div>
        <Separator />
        <TooltipProvider>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <p className="text-muted-foreground flex items-center">
                       Total before Profit
                    </p>
                    <p className="font-semibold">{formatCurrency(subtotalWithMisc)}</p>
                </div>
                <div className="flex justify-between">
                    <p className="text-muted-foreground">Profit</p>
                    <p className="font-semibold">{formatCurrency(profitAmount)}</p>
                </div>
                 <div className="flex justify-between">
                    <p className="text-muted-foreground">{taxType} ({taxRate}%)</p>
                    <p className="font-semibold">{formatCurrency(taxAmount)}</p>
                </div>
            </div>
        </TooltipProvider>
        <Separator />
        <div className="flex justify-between font-bold text-base bg-primary/10 p-2 rounded-md">
            <p>Grand Total</p>
            <p>{formatCurrency(totalPrice)}</p>
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
                            <span>{formatCurrency(profitAmount * (value / 100))}</span>
                        </div>
                    )
                })}
            </div>
      </CardFooter>
    </Card>
  );
}
