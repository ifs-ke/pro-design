
import { create } from 'zustand';
import type * as z from 'zod';
import type { formSchema } from '@/components/design/cost-form';
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

export type FormValues = z.infer<typeof formSchema>;

export type Allocation = {
  salaries: number;
  savings: number;
  futureDev: number;
  csr: number;
};

type Calculations = {
  materialCost: number;
  laborCost: number;
  operationalCost: number;
  affiliateCost: number;
  miscCost: number;
  totalBaseCost: number;
  profit: number;
  subtotal: number; // Net Revenue (Base Cost + Profit)
  grandTotal: number;
  tax: number;
  taxRate: number;
  taxType: string;
  profitMargin: number;
  businessType: string;
};

interface CostState {
  formValues: FormValues;
  allocations: Allocation;
  calculations: Calculations;
  setFormValues: (values: FormValues) => void;
  setAllocations: (allocations: Allocation) => void;
}

const defaultFormValues: FormValues = {
  materials: [],
  labor: [],
  operations: [],
  affiliates: [],
  businessType: "vat_registered",
  taxRate: 16,
  profitMargin: 25,
  miscPercentage: 5,
};

const defaultAllocations: Allocation = {
  salaries: 40,
  savings: 20,
  futureDev: 20,
  csr: 20,
};

const performCalculations = (formValues: FormValues): Calculations => {
    const {
      materials,
      labor,
      operations,
      affiliates,
      taxRate,
      profitMargin,
      businessType,
      miscPercentage,
    } = formValues;

    const materialCost = materials?.reduce((acc, item) => acc + (Number(item.cost) || 0), 0) ?? 0;
    const laborCost = labor?.reduce((acc, item) => acc + ((Number(item.units) || 0) * (Number(item.rate) || 0)), 0) ?? 0;
    const fixedOperationalCost = operations?.reduce((acc, item) => acc + (Number(item.cost) || 0), 0) ?? 0;
    
    const fixedAffiliateCost = affiliates?.reduce((acc, item) => {
        if (!item.rate || item.rateType === 'percentage') return acc;
        return acc + ((Number(item.units) || 0) * (Number(item.rate) || 0));
    }, 0) ?? 0;

    const totalFixedCosts = materialCost + laborCost + fixedOperationalCost + fixedAffiliateCost;

    const totalAffiliatePercentage = affiliates?.reduce((acc, item) => {
        if (item.rateType === 'percentage') {
            return acc + ((Number(item.rate) || 0) / 100);
        }
        return acc;
    }, 0) ?? 0;
    
    const miscDecimal = (miscPercentage || 0) / 100;
    const profitMarginDecimal = (profitMargin || 0) / 100;
    const totalPercentageCosts = totalAffiliatePercentage + miscDecimal;
    
    let grandTotal = 0;
    let subtotal = 0;
    let tax = 0;
    let taxType = "VAT";
    let effectiveTaxRate = taxRate || 0;

    if (businessType === 'vat_registered') {
        taxType = "VAT";
        const denominator = 1 - (totalPercentageCosts * (1 + (effectiveTaxRate/100)) * (1 + profitMarginDecimal));
        if (denominator > 0) {
            subtotal = (totalFixedCosts * (1 + profitMarginDecimal)) / denominator;
            tax = subtotal * (effectiveTaxRate / 100);
            grandTotal = subtotal + tax;
        }

    } else { // sole_proprietor
        taxType = "TOT";
        effectiveTaxRate = 3;
        const denominator = 1 - (totalPercentageCosts * (1 + profitMarginDecimal) / (1 - (effectiveTaxRate/100)));
        if (denominator > 0) {
            subtotal = (totalFixedCosts * (1 + profitMarginDecimal)) / denominator;
            grandTotal = subtotal / (1 - (effectiveTaxRate / 100));
            tax = grandTotal - subtotal;
        }
    }
    
    if (grandTotal < 0) grandTotal = 0;
    if (subtotal < 0) subtotal = 0;

    const miscCost = grandTotal * miscDecimal;
    const percentageAffiliateCost = grandTotal * totalAffiliatePercentage;
    const affiliateCost = fixedAffiliateCost + percentageAffiliateCost;
    const operationalCost = fixedOperationalCost + miscCost;
    const totalBaseCost = totalFixedCosts + percentageAffiliateCost + miscCost;
    const profit = subtotal - totalBaseCost;
    
    return {
      materialCost,
      laborCost,
      operationalCost,
      affiliateCost,
      miscCost,
      totalBaseCost,
      profit,
      subtotal,
      grandTotal,
      tax,
      taxRate: effectiveTaxRate,
      taxType,
      profitMargin: profitMargin || 0,
      businessType: formValues.businessType,
    };
}


export const useStore = create<CostState>()(
    devtools(
        persist(
            (set) => ({
                formValues: defaultFormValues,
                allocations: defaultAllocations,
                calculations: performCalculations(defaultFormValues),

                setFormValues: (values) => {
                    set({
                        formValues: values,
                        calculations: performCalculations(values),
                    });
                },

                setAllocations: (allocations) => {
                    set({ allocations });
                },
            }),
            {
                name: "cost-store-storage",
                storage: createJSONStorage(() => localStorage), 
                // Only persist formValues and allocations
                partialize: (state) => ({ formValues: state.formValues, allocations: state.allocations }),
            }
        ),
        { name: "CostStore" }
    )
);

// We need to handle hydration manually to avoid mismatches between server and client.
// On page load, we'll call rehydrate() to get the latest persisted state.
if (typeof window !== 'undefined') {
  useStore.persist.rehydrate();
}
