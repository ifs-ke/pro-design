'use client';

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
import {
    Package,
    Wrench,
    Users,
    Cog,
    Handshake,
    TrendingUp,
    Sigma,
    ShieldCheck,
    Percent,
    FileText,
    Receipt,
    Banknote,
    SlidersHorizontal,
    PiggyBank,
    Lightbulb,
    Heart,
} from 'lucide-react';
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

const CostItem = ({ icon, label, value, isSubItem = false, isBold = false }: { icon: React.ReactNode, label: string, value: string | number, isSubItem?: boolean, isBold?: boolean }) => (
    <div className={`flex justify-between items-center text-sm sm:text-base ${isSubItem ? 'pl-8' : ''}`}>
        <span className="text-muted-foreground flex items-center">{icon}<span className="ml-2">{label}</span></span>
        <span className={isBold ? 'font-semibold' : ''}>{typeof value === 'number' ? formatCurrency(value) : value}</span>
    </div>
);

export function CostBreakdown({ calculations, allocations, suggestedCalculations, formValues }: CostBreakdownProps) {
  const {
    totalMaterialCost,
    totalLaborCost,
    totalOperationCost,
    totalAffiliateCost,
    subtotal,
    miscAmount,
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
  
  const taxType = businessType === 'vat_registered' ? "VAT" : "Tax";
  const hasDeductibles = (nssfAmount || 0) > 0 || (shifAmount || 0) > 0;

  return (
    <Card className="h-full flex flex-col shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Quote Breakdown</CardTitle>
        <CardDescription>A detailed breakdown of the project costs and totals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        {suggestedCalculations && (
            <>
                <QuoteVariance suggested={suggestedCalculations} final={calculations} />
                <Separator className="my-3"/>
            </>        
        )}
        
        <CostItem icon={<Package className="w-4 h-4"/>} label="Material Cost" value={totalMaterialCost} />
        <CostItem icon={<Wrench className="w-4 h-4"/>} label="Labor Cost" value={totalLaborCost} />
        <CostItem icon={<Cog className="w-4 h-4"/>} label="Operational Cost" value={totalOperationCost} />
        <CostItem icon={<Handshake className="w-4 h-4"/>} label="Affiliate Cost" value={totalAffiliateCost} />
        <CostItem icon={<Users className="w-4 h-4"/>} label="Salaries" value={salaryAmount} />
        {hasDeductibles && (
          <>
            <CostItem icon={<FileText className="w-3 h-3"/>} label="NSSF" value={nssfAmount} isSubItem={true} />
            <CostItem icon={<Receipt className="w-3 h-3"/>} label="SHIF" value={shifAmount} isSubItem={true} />
          </>
        )}

        <Separator className="my-2" />
        <div className="flex justify-between items-center text-sm sm:text-base">
          <span className="text-muted-foreground font-semibold flex items-center"><Sigma className="w-4 h-4 mr-2"/> Sub-total</span>
          <span className="font-bold">{formatCurrency(subtotal)}</span>
        </div>
        <Separator className="my-2" />

        <CostItem icon={<SlidersHorizontal className="w-4 h-4"/>} label="Contingency / Misc." value={miscAmount} isBold={true} />
        <CostItem icon={<Percent className="w-4 h-4"/>} label={`${taxType} (${taxRate}%)`} value={taxAmount} isBold={true} />

        <Separator className="my-2"/>

        <div className="flex justify-between items-center">
          <span className="font-semibold flex items-center text-sm sm:text-base"><Banknote className="w-4 h-4 mr-2 text-muted-foreground"/> Total Project Cost</span>
          <span className="font-bold text-base sm:text-lg">{formatCurrency(totalCost)}</span>
        </div>
        <CostItem icon={<TrendingUp className="w-4 h-4 text-emerald-500"/>} label="Profit Margin" value={profitAmount} isBold={true} />
        
        <Separator className="my-2"/>
        
        <div className="flex justify-between items-center text-lg sm:text-xl font-bold text-primary pt-1">
            <span className="flex items-center"><ShieldCheck className="w-5 h-5 mr-2"/>Final Quote Price</span>
            <span>{formatCurrency(totalPrice)}</span>
        </div>

      </CardContent>
       <CardFooter className="bg-muted/30 mt-4 p-4 rounded-b-lg flex-col items-start gap-3 border-t">
            <h4 className="font-semibold mb-1 text-sm sm:text-base">Profit Allocation</h4>
            <div className="space-y-2 text-sm sm:text-base w-full">
                {Object.entries(allocations).map(([key, value]) => {
                    const meta = allocationMeta[key as keyof typeof allocationMeta];
                    if (!meta) return null;
                    const Icon = meta.icon;
                    return (
                        <div key={key} className="flex justify-between items-center text-muted-foreground">
                            <span className="flex items-center gap-2"><Icon className="size-4" />{meta.label} ({value}%)</span>
                            <span className="font-medium text-foreground">{formatCurrency(profitAmount * (value / 100))}</span>
                        </div>
                    )
                })}
            </div>
      </CardFooter>
    </Card>
  );
}
