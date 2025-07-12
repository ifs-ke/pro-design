
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
  miscellaneousCost: number;
  totalBaseCost: number;
  profit: number;
  subtotal: number;
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
  updateProfitMarginFromFinalQuote: (finalQuote: number) => void;
}

const defaultFormValues: FormValues = {
  materials: [{ name: "Initial Material", cost: 10000 }],
  labor: [{ vendor: "Main Vendor", units: 80, rate: 50, rateType: 'hourly' }],
  operations: [{ name: "Initial Operation Cost", cost: 2000 }],
  businessType: "vat_registered",
  taxRate: 16,
  profitMargin: 25,
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
      taxRate,
      profitMargin,
      businessType,
    } = formValues;

    const materialCost = materials?.reduce((acc, item) => acc + (item.cost || 0), 0) ?? 0;
    const laborCost = labor?.reduce((acc, item) => acc + ((item.units || 0) * (item.rate || 0)), 0) ?? 0;
    const operationalCost = operations?.reduce((acc, item) => acc + (item.cost || 0), 0) ?? 0;
    
    const baseCost = materialCost + laborCost + operationalCost;
    const miscellaneousCost = baseCost * 0.10;
    const totalBaseCost = baseCost + miscellaneousCost;
    const profit = totalBaseCost * ((profitMargin || 0) / 100);
    const subtotal = totalBaseCost + profit; // This is Net Revenue

    let tax = 0;
    let grandTotal = 0;
    let effectiveTaxRate = taxRate || 0;
    let taxType = "VAT";

    if (businessType === 'vat_registered') {
        tax = subtotal * (effectiveTaxRate / 100);
        grandTotal = subtotal + tax;
    } else { // sole_proprietor
        taxType = "TOT";
        effectiveTaxRate = 3;
        // TOT is calculated on gross sales. So we need to solve for grandTotal where grandTotal = subtotal + 0.03 * grandTotal
        // grandTotal (1 - 0.03) = subtotal  => grandTotal = subtotal / 0.97
        grandTotal = subtotal / (1 - (effectiveTaxRate / 100));
        tax = grandTotal - subtotal;
    }
    
    return {
      materialCost,
      laborCost,
      operationalCost,
      miscellaneousCost,
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
            (set, get) => ({
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

                updateProfitMarginFromFinalQuote: (finalQuote) => {
                    const { calculations, formValues } = get();
                    const { totalBaseCost, businessType } = calculations;

                    let subtotal;
                    if (businessType === 'vat_registered') {
                    const taxRate = formValues.taxRate || 0;
                    subtotal = finalQuote / (1 + (taxRate / 100));
                    } else { // sole_proprietor
                    const effectiveTaxRate = 3;
                    subtotal = finalQuote * (1 - (effectiveTaxRate / 100));
                    }

                    const newProfit = subtotal - totalBaseCost;
                    
                    let newProfitMargin = 0;
                    if (totalBaseCost > 0) {
                    newProfitMargin = (newProfit / totalBaseCost) * 100;
                    }

                    if (newProfitMargin >= 0) {
                        const newFormValues = {
                            ...formValues,
                            profitMargin: parseFloat(newProfitMargin.toFixed(2)),
                        };
                        set({
                            formValues: newFormValues,
                            calculations: performCalculations(newFormValues),
                        });
                    }
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
