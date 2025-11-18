
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { FormValues, Calculations } from "@/store/cost-store";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Ksh 0.00';
  }
  const roundedAmount = Math.round(amount * 100) / 100;
  
  return new Intl.NumberFormat('en-KE', { 
    style: 'currency', 
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundedAmount).replace('KES', 'Ksh');
};

export const performCalculations = (formValues: FormValues): Calculations => {
    const totalMaterialCost = formValues.materials?.reduce((acc, item) => acc + ((item.cost || 0) * (item.quantity || 0)), 0) || 0;
    const totalLaborCost = formValues.labor?.reduce((acc, item) => acc + (item.rate * item.hours * item.days), 0) || 0;
    const totalOperationCost = formValues.operations?.reduce((acc, item) => acc + (item.cost || 0), 0) || 0;

    const directCostBase = totalMaterialCost + totalLaborCost + totalOperationCost;

    const totalAffiliateCost = formValues.affiliates?.reduce((acc, item) => {
        const rate = Number(item.rate) || 0;
        if (item.rateType === 'percentage') {
            return acc + (directCostBase * (rate / 100));
        }
        const units = Number(item.units) || 0;
        return acc + (rate * units);
    }, 0) || 0;

    const subtotal = directCostBase + totalAffiliateCost;

    const totalGrossSalary = formValues.salaries?.reduce((acc, s) => acc + (Number(s.salary) || 0), 0) || 0;
    const nssfAmount = formValues.enableNSSF ? totalGrossSalary * 0.06 : 0;
    const shifAmount = formValues.enableSHIF ? totalGrossSalary * 0.0275 : 0;
    
    const salaryPercentageAmount = (formValues.salaryPercentage / 100) * directCostBase;
    const salaryAmount = salaryPercentageAmount + totalGrossSalary + nssfAmount + shifAmount;

    const miscAmount = (formValues.miscPercentage / 100) * subtotal;

    const totalCostBeforeProfit = subtotal + salaryAmount + miscAmount;
    const profitAmount = totalCostBeforeProfit / (1 - (formValues.profitMargin / 100)) - totalCostBeforeProfit;
    const grandTotal = totalCostBeforeProfit + profitAmount;

    return {
        totalMaterialCost,
        totalLaborCost,
        totalOperationCost,
        totalAffiliateCost,
        subtotal,
        salaryAmount,
        miscAmount,
        nssfAmount,
        shifAmount,
        totalCost: totalCostBeforeProfit,
        profitAmount,
        grandTotal,
    };
};
