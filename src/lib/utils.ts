
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { FormValues, Calculations } from "@/store/cost-store";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
    }).format(value);
  };

export const performCalculations = (formValues: FormValues): Calculations => {
    const materialsTotal = formValues.materials?.reduce((acc, item) => acc + (item.cost * item.quantity), 0) || 0;
    const laborTotal = formValues.labor?.reduce((acc, item) => acc + (item.rate * item.units), 0) || 0;
    const operationsTotal = formValues.operations?.reduce((acc, item) => acc + item.cost, 0) || 0;

    const subtotal = materialsTotal + laborTotal + operationsTotal;

    const affiliatesTotal = formValues.affiliates?.reduce((acc, item) => {
        if (item.rateType === 'percentage') {
            return acc + (subtotal * (item.rate / 100));
        }
        return acc + (item.rate * (item.units || 0));
    }, 0) || 0;

    const baseTotal = subtotal + affiliatesTotal;

    let taxAmount = 0;
    if (formValues.businessType === 'vat_registered') {
        taxAmount = baseTotal * (formValues.taxRate / 100);
    } else if (formValues.businessType === 'sole_proprietor') {
        taxAmount = baseTotal * 0.03;
    }

    const totalCost = baseTotal + taxAmount;

    const profitAmount = totalCost / (1 - (formValues.profitMargin / 100)) - totalCost;
    const miscAmount = totalCost * (formValues.miscPercentage / 100);

    let nssfAmount = 0;
    if (formValues.enableNSSF) {
        nssfAmount = Math.min((formValues.grossSalary || 0) * 0.06, 1080) * (formValues.numberOfPeople || 1);
    }

    let shifAmount = 0;
    if (formValues.enableSHIF) {
        shifAmount = (formValues.grossSalary || 0) * 0.0275 * (formValues.numberOfPeople || 1);
    }

    const salariesTotal = (formValues.grossSalary || 0) * (formValues.numberOfPeople || 1) + nssfAmount + shifAmount;
    const salaryAmount = baseTotal * ((formValues.salaryPercentage || 0) / 100) + salariesTotal;

    const grandTotal = totalCost + profitAmount + miscAmount + salaryAmount;

    return {
        materialsTotal,
        laborTotal,
        operationsTotal,
        affiliatesTotal,
        subtotal: baseTotal, // subtotal is now baseTotal
        taxAmount,
        totalCost,
        profitAmount,
        miscAmount,
        salaryAmount,
        grandTotal,
        nssfAmount,
        shifAmount,
    };
};
