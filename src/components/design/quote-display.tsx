"use client";

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
import { Users, PiggyBank, Lightbulb, Heart } from "lucide-react";

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
  };
  allocations: Allocation;
}

const allocationMeta = {
  salaries: { icon: Users, label: "Salaries" },
  savings: { icon: PiggyBank, label: "Savings" },
  futureDev: { icon: Lightbulb, label: "Future Dev" },
  csr: { icon: Heart, label: "CSR" },
};


export function QuoteDisplay({ calculations, allocations }: QuoteDisplayProps) {
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
  } = calculations;

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
        <div className="space-y-2 text-sm">
            <div className="flex justify-between"><p className="text-muted-foreground">Subtotal</p><p className="font-semibold">{formatCurrency(subtotal)}</p></div>
            <div className="flex justify-between"><p className="text-muted-foreground">Tax</p><p className="font-semibold">{formatCurrency(tax)}</p></div>
        </div>
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
      <CardFooter className="bg-primary/10 mt-4 p-4 rounded-b-lg">
        <div className="w-full flex justify-between items-center">
          <CardTitle className="text-lg">Grand Total</CardTitle>
          <p className="text-2xl font-bold text-primary">{formatCurrency(grandTotal)}</p>
        </div>
      </CardFooter>
    </Card>
  );
}
