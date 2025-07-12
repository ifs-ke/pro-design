
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
import type { Allocation } from "@/store/cost-store";
import { formatCurrency } from "@/lib/utils";
import { Users, PiggyBank, Lightbulb, Heart, Info, TrendingUp, ReceiptText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface CostBreakdownProps {
  calculations: {
    materialCost: number;
    laborCost: number;
    operationalCost: number;
    totalBaseCost: number;
    profit: number;
    subtotal: number;
    tax: number;
    grandTotal: number;
    taxRate: number;
    taxType: string;
  };
  allocations: Allocation;
}

const allocationMeta = {
  salaries: { icon: Users, label: "Salaries" },
  savings: { icon: PiggyBank, label: "Savings" },
  futureDev: { icon: Lightbulb, label: "Future Dev" },
  csr: { icon: Heart, label: "CSR" },
};


export function CostBreakdown({ calculations, allocations }: CostBreakdownProps) {
  const {
    materialCost,
    laborCost,
    operationalCost,
    totalBaseCost,
    profit,
    subtotal,
    tax,
    taxRate,
    taxType,
  } = calculations;

  // For clarity:
  const netRevenue = subtotal; // Revenue before tax

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
        <CardDescription>
          A detailed breakdown of the project costs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div className="space-y-2 text-sm">
            <div className="flex justify-between"><p className="text-muted-foreground">Material Cost</p><p>{formatCurrency(materialCost)}</p></div>
            <div className="flex justify-between"><p className="text-muted-foreground">Labor Cost</p><p>{formatCurrency(laborCost)}</p></div>
            <div className="flex justify-between"><p className="text-muted-foreground">Operational Cost</p><p>{formatCurrency(operationalCost)}</p></div>
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

      </CardContent>
       <CardFooter className="bg-primary/5 mt-4 p-4 rounded-b-lg flex-col items-start gap-2">
            <h4 className="font-medium mb-2 text-sm">Profit Allocation Details</h4>
            <div className="space-y-2 text-sm w-full">
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
      </CardFooter>
    </Card>
  );
}
