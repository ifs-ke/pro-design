
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
    } = formValues;

    const materialCost = materials?.reduce((acc, item) => acc + (item.cost || 0), 0) ?? 0;
    const laborCost = labor?.reduce((acc, item) => acc + ((item.units || 0) * (item.rate || 0)), 0) ?? 0;
    const operationalCost = operations?.reduce((acc, item) => acc + (item.cost || 0), 0) ?? 0;
    
    // Calculate fixed costs from affiliates (hourly/daily)
    const fixedAffiliateCost = affiliates?.reduce((acc, item) => {
        if (!item.rate || item.rateType === 'percentage') return acc;
        return acc + ((item.units || 0) * item.rate);
    }, 0) ?? 0;

    // Sum of all fixed costs
    const totalFixedCosts = materialCost + laborCost + operationalCost + fixedAffiliateCost;

    // Sum of all percentage rates from affiliates
    const totalAffiliatePercentage = affiliates?.reduce((acc, item) => {
        if (item.rateType === 'percentage') {
            return acc + (item.rate / 100);
        }
        return acc;
    }, 0) ?? 0;
    
    const profitMarginDecimal = (profitMargin || 0) / 100;
    
    let grandTotal = 0;
    let subtotal = 0;
    let tax = 0;
    let taxType = "VAT";
    let effectiveTaxRate = taxRate || 0;

    if (businessType === 'vat_registered') {
        taxType = "VAT";
        // Let G = grandTotal, F = totalFixedCosts, A = totalAffiliatePercentage, P = profitMarginDecimal, T = taxRate
        // G = (F + G*A) * (1 + P) * (1 + T)
        // G = (F + G*A) * (1 + P + T + P*T)
        // G = F*(...) + G*A*(...)
        // G - G*A*(...) = F*(...)
        // G * (1 - A*(1+P)) = F*(1+P)
        // grandTotal = F * (1+P) / (1 - A*(1+P))
        // And for VAT, it's applied on the subtotal.
        // Let S = subtotal. G = S * (1 + T). S = F/(1 - A*(1+P)). G = F/(1 - A*(1+P)) * (1+T) NO
        // S = Base + Profit = (F + G*A) + (F + G*A)*P = (F+G*A)(1+P)
        // G = S * (1+T) => S = G/(1+T)
        // G/(1+T) = (F+G*A)(1+P)
        // G = (1+T)(F(1+P) + G*A(1+P))
        // G = F(1+T)(1+P) + G*A(1+T)(1+P)
        // G(1 - A(1+T)(1+P)) = F(1+T)(1+P)
        // G = F(1+T)(1+P) / (1 - A(1+T)(1+P)) --- THIS IS WRONG. Let's simplify.
        // BaseCost = F + G*A. Profit = BaseCost*P. Subtotal = BaseCost*(1+P). G = Subtotal*(1+T).
        // BaseCost = F + Subtotal*(1+T)*A
        // Subtotal/(1+P) = F + Subtotal*(1+T)*A
        // Subtotal/(1+P) - Subtotal*(1+T)*A = F
        // Subtotal * (1/(1+P) - A(1+T)) = F
        // Subtotal = F / (1/(1+P) - A(1+T))
        
        const denominator = (1 / (1 + profitMarginDecimal)) - (totalAffiliatePercentage * (1 + (effectiveTaxRate / 100)));
        if (denominator > 0) {
            subtotal = totalFixedCosts / denominator;
            tax = subtotal * (effectiveTaxRate / 100);
            grandTotal = subtotal + tax;
        }

    } else { // sole_proprietor
        taxType = "TOT";
        effectiveTaxRate = 3;
        // Let G = grandTotal, F = totalFixedCosts, A = totalAffiliatePercentage, P = profitMarginDecimal, T_tot = 0.03
        // BaseCost = F + G*A. Subtotal = BaseCost*(1+P). G = Subtotal / (1-T_tot).
        // BaseCost = F + (Subtotal/(1-T_tot))*A.
        // Subtotal/(1+P) = F + (Subtotal/(1-T_tot))*A.
        // Subtotal/(1+P) - Subtotal*A/(1-T_tot) = F.
        // Subtotal * (1/(1+P) - A/(1-T_tot)) = F.
        // Subtotal = F / (1/(1+P) - A/(1-T_tot)).
        const denominator = (1 / (1 + profitMarginDecimal)) - (totalAffiliatePercentage / (1 - (effectiveTaxRate / 100)));
        if (denominator > 0) {
            subtotal = totalFixedCosts / denominator;
            grandTotal = subtotal / (1 - (effectiveTaxRate / 100));
            tax = grandTotal - subtotal;
        }
    }
    
    if (grandTotal < 0) grandTotal = 0; // Prevent negative totals

    const percentageAffiliateCost = grandTotal * totalAffiliatePercentage;
    const affiliateCost = fixedAffiliateCost + percentageAffiliateCost;
    const totalBaseCost = totalFixedCosts + percentageAffiliateCost;
    const profit = subtotal - totalBaseCost;
    
    return {
      materialCost,
      laborCost,
      operationalCost,
      affiliateCost,
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
