
import { create } from 'zustand';
import type * as z from 'zod';
import type { formSchema } from '@/components/design/cost-form';
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

export type FormValues = z.infer<typeof formSchema>;

export type Allocation = {
  savings: number;
  futureDev: number;
  csr: number;
};

export type Calculations = {
  materialCost: number;
  laborCost: number;
  operationalCost: number;
  affiliateCost: number;
  miscCost: number;
  salaryCost: number;
  totalBaseCost: number;
  profit: number;
  subtotal: number; // Net Revenue (Base Cost + Profit)
  grandTotal: number;
  tax: number;
  taxRate: number;
  taxType: string;
  profitMargin: number;
  businessType: string;
  numberOfPeople?: number;
};

interface CostState {
  formValues: FormValues;
  allocations: Allocation;
  calculations: Calculations;
  loadedQuoteId: string | null;
  setFormValues: (values: FormValues) => void;
  setAllocations: (allocations: Allocation) => void;
  loadQuoteIntoForm: (quote: any) => void; 
  resetForm: () => void;
}

const defaultFormValues: FormValues = {
  clientId: '',
  projectId: '',
  materials: [],
  labor: [],
  operations: [],
  affiliates: [],
  businessType: "vat_registered",
  taxRate: 16,
  profitMargin: 25,
  miscPercentage: 0,
  salaryPercentage: 0,
  numberOfPeople: 1,
};

const defaultAllocations: Allocation = {
  savings: 40,
  futureDev: 30,
  csr: 30,
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
      salaryPercentage,
      numberOfPeople
    } = formValues;

    const materialCost = materials?.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.cost) || 0)), 0) ?? 0;
    const laborCost = labor?.reduce((acc, item) => acc + ((Number(item.units) || 0) * (Number(item.rate) || 0)), 0) ?? 0;
    const fixedOperationalCost = operations?.reduce((acc, item) => acc + (Number(item.cost) || 0), 0) ?? 0;
    
    const fixedAffiliateCost = affiliates?.reduce((acc, item) => {
        if (!item.rate || item.rateType === 'percentage') return acc;
        return acc + ((Number(item.units) || 0) * (Number(item.rate) || 0));
    }, 0) ?? 0;
    
    const percentageAffiliateRate = affiliates?.reduce((acc, item) => {
        if (item.rateType === 'percentage') {
            return acc + ((Number(item.rate) || 0) / 100);
        }
        return acc;
    }, 0) ?? 0;

    const miscRate = (miscPercentage || 0) / 100;
    const salaryRate = (salaryPercentage || 0) / 100;
    
    const fixedCosts = materialCost + laborCost + fixedOperationalCost + fixedAffiliateCost;
    
    let grandTotal = 0;
    let tax = 0;
    let taxType = "VAT";
    let effectiveTaxRate = taxRate || 0;
    
    const profitMarginRate = (profitMargin || 0) / 100;

    let taxRateDecimal = 0;

    if (businessType === 'vat_registered') {
        taxType = "VAT";
        taxRateDecimal = (effectiveTaxRate / 100);
    } else if (businessType === 'sole_proprietor') {
        taxType = "TOT";
        effectiveTaxRate = 3;
        taxRateDecimal = effectiveTaxRate / 100;
    } else { // no_tax
        taxType = "No Tax";
        effectiveTaxRate = 0;
        taxRateDecimal = 0;
    }
    
    let denominator = 1;
    let numerator = fixedCosts;

    if (businessType === 'vat_registered') {
        const percentageRates = miscRate + salaryRate + percentageAffiliateRate;
        numerator = (1 + taxRateDecimal) * fixedCosts;
        denominator = (1 - profitMarginRate) - ((1 + taxRateDecimal) * percentageRates);
    } else { // sole_proprietor or no_tax
        const percentageRates = miscRate + salaryRate + percentageAffiliateRate;
        numerator = fixedCosts;
        denominator = ((1 - taxRateDecimal) * (1 - profitMarginRate)) - percentageRates;
    }

    if (denominator > 0) {
        grandTotal = numerator / denominator;
    } else {
        grandTotal = 0;
    }

    if (grandTotal < 0 || !isFinite(grandTotal)) grandTotal = 0;
    
    const subtotal = businessType === 'vat_registered' ? grandTotal / (1 + taxRateDecimal) : grandTotal * (1 - taxRateDecimal);
    tax = grandTotal - subtotal;

    const miscCost = grandTotal * miscRate;
    const salaryCost = grandTotal * salaryRate;
    const percentageAffiliateCost = grandTotal * percentageAffiliateRate;

    const affiliateCost = fixedAffiliateCost + percentageAffiliateCost;
    const operationalCost = fixedOperationalCost; // miscCost and salaryCost are now top-level costs, not part of operations
    const totalBaseCost = materialCost + laborCost + operationalCost + affiliateCost + miscCost + salaryCost;
    
    const finalProfit = subtotal - totalBaseCost;
    
    return {
      materialCost,
      laborCost,
      operationalCost,
      affiliateCost,
      miscCost,
      salaryCost,
      totalBaseCost,
      profit: finalProfit > 0 ? finalProfit : 0,
      subtotal: subtotal,
      grandTotal,
      tax,
      taxRate: effectiveTaxRate,
      taxType,
      profitMargin: finalProfit > 0 && subtotal > 0 ? (finalProfit / subtotal) * 100 : 0,
      businessType: formValues.businessType,
      numberOfPeople: numberOfPeople,
    };
}


export const useStore = create<CostState>()(
  devtools(
    persist(
      (set) => ({
        formValues: defaultFormValues,
        allocations: defaultAllocations,
        calculations: performCalculations(defaultFormValues),
        loadedQuoteId: null,

        setFormValues: (values) => {
          set({
            formValues: values,
            calculations: performCalculations(values),
          });
        },

        setAllocations: (allocations) => {
          set({ allocations });
        },

        loadQuoteIntoForm: (quote) => {
          if (quote && quote.formValues && quote.allocations) {
            const formVals = quote.formValues as FormValues;
            const allocs = quote.allocations as Allocation;
            set({
              formValues: formVals,
              allocations: allocs,
              calculations: performCalculations(formVals),
              loadedQuoteId: quote.id,
            });
          }
        },
        resetForm: () => {
          set({
            formValues: defaultFormValues,
            allocations: defaultAllocations,
            calculations: performCalculations(defaultFormValues),
            loadedQuoteId: null,
          });
        },
      }),
      {
        name: 'cost-form-storage', 
        storage: createJSONStorage(() => sessionStorage),
      }
    ),
    { name: "CostFormStore" }
  )
);
