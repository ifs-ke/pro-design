'use client';

import type { Calculations } from '@/store/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from '@/lib/utils';
import {
  Package,
  Wrench,
  Users,
  Cog,
  Handshake,
  TrendingUp,
  Sigma,
  Briefcase,
  ShieldCheck,
  Percent,
  FileText,
  Receipt,
  SlidersHorizontal,
  Banknote
} from 'lucide-react';

interface OverviewSectionProps {
  calculations: Calculations;
}

const CostItem = ({ icon, label, value, isSubItem = false }: { icon: React.ReactNode, label: string, value: string | number, isSubItem?: boolean }) => (
    <div className={`flex justify-between items-center ${isSubItem ? 'pl-6' : ''}`}>
        <span className="text-muted-foreground flex items-center text-xs">{icon}<span className="ml-2">{label}</span></span>
        <span className="font-medium text-xs">{typeof value === 'number' ? formatCurrency(value) : value}</span>
    </div>
);

export function OverviewSection({ calculations }: OverviewSectionProps) {
  const {
    totalMaterialCost,
    totalLaborCost,
    salaryAmount,
    nssfAmount,
    shifAmount,
    totalOperationCost,
    miscAmount,
    totalAffiliateCost,
    subtotal,
    taxAmount,
    totalCost,
    profitAmount,
    totalPrice,
  } = calculations;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary"/>
            Project Financial Overview
        </CardTitle>
        <CardDescription>A complete financial summary of your project.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-3">
        <CostItem icon={<Package className="w-4 h-4"/>} label="Total Material Cost" value={totalMaterialCost} />
        <CostItem icon={<Wrench className="w-4 h-4"/>} label="Total Labor Cost" value={totalLaborCost} />
        <CostItem icon={<Users className="w-4 h-4"/>} label="Total Salaries" value={salaryAmount} />
        <CostItem icon={<FileText className="w-3 h-3"/>} label="NSSF" value={nssfAmount} isSubItem={true} />
        <CostItem icon={<Receipt className="w-3 h-3"/>} label="SHIF" value={shifAmount} isSubItem={true} />
        <CostItem icon={<Cog className="w-4 h-4"/>} label="Fixed Operational Costs" value={totalOperationCost} />
        <CostItem icon={<Handshake className="w-4 h-4"/>} label="Affiliates & Partners" value={totalAffiliateCost} />
        
        <Separator className="my-2"/>
        
        <div className="flex justify-between items-center">
          <span className="font-semibold text-muted-foreground flex items-center"><Sigma className="w-4 h-4 mr-2"/> Sub-total</span>
          <span className="font-bold">{formatCurrency(subtotal)}</span>
        </div>
        
        <Separator className="my-2"/>

        <CostItem icon={<SlidersHorizontal className="w-4 h-4"/>} label="Contingency / Misc." value={miscAmount} />
        <CostItem icon={<Percent className="w-4 h-4"/>} label="VAT (Tax)" value={taxAmount} />

        <Separator className="my-2"/>

        <div className="flex justify-between items-center">
          <span className="font-semibold text-muted-foreground flex items-center"><Banknote className="w-4 h-4 mr-2"/> Total Project Cost</span>
          <span className="font-bold">{formatCurrency(totalCost)}</span>
        </div>

        <CostItem icon={<TrendingUp className="w-4 h-4 text-emerald-500"/>} label="Profit Margin" value={profitAmount} />
        
        <Separator className="my-2"/>
        
        <div className="flex justify-between items-center text-lg font-bold text-primary pt-2">
            <span className="flex items-center"><ShieldCheck className="w-5 h-5 mr-2"/>Final Quote Price</span>
            <span>{formatCurrency(totalPrice)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
