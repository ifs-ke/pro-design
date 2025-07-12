
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
};

export type PublishedQuote = {
    id: string;
    timestamp: number;
    clientName: string;
    status: 'Draft' | 'Sent' | 'Approved' | 'Declined';
    formValues: FormValues;
    allocations: Allocation;
    calculations: Calculations; // This is the FINAL calculation
    suggestedCalculations: Calculations; // This is the originally suggested calculation
}

interface CostState {
  formValues: FormValues;
  allocations: Allocation;
  calculations: Calculations;
  publishedQuotes: PublishedQuote[];
  setFormValues: (values: FormValues) => void;
  setAllocations: (allocations: Allocation) => void;
  publishQuote: (finalCalculations: Calculations, suggestedCalculations: Calculations) => string; // Returns the new quote ID
  updateQuoteStatus: (id: string, status: PublishedQuote['status']) => void;
  deleteQuote: (id: string) => void;
  loadQuoteIntoForm: (id: string) => void;
}

const defaultFormValues: FormValues = {
  clientName: '',
  materials: [],
  labor: [],
  operations: [],
  affiliates: [],
  businessType: "vat_registered",
  taxRate: 16,
  profitMargin: 25,
  miscPercentage: 0,
  salaryPercentage: 0,
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
    const profitMarginRate = (profitMargin || 0) / 100;

    const fixedCosts = materialCost + laborCost + fixedOperationalCost + fixedAffiliateCost;
    
    let grandTotal = 0;
    let subtotal = 0;
    let tax = 0;
    let taxType = "VAT";
    let effectiveTaxRate = taxRate || 0;
    let taxRateDecimal = 0;
    let profit = 0;

    const denominatorForProfit = 1 - profitMarginRate;
    if (denominatorForProfit > 0) {
      profit = (fixedCosts * profitMarginRate) / denominatorForProfit;
    }

    const baseForPercentages = fixedCosts + profit;

    if (businessType === 'vat_registered') {
        taxType = "VAT";
        taxRateDecimal = (effectiveTaxRate / 100);

        const denominator = 1 - miscRate - salaryRate - percentageAffiliateRate;
        if (denominator > 0) {
            const netRevenue = baseForPercentages / denominator;
            grandTotal = netRevenue * (1 + taxRateDecimal);
            tax = netRevenue * taxRateDecimal;
        }

    } else { // sole_proprietor with Turnover Tax
        taxType = "TOT";
        effectiveTaxRate = 3;
        taxRateDecimal = effectiveTaxRate / 100;

        const denominator = 1 - miscRate - salaryRate - percentageAffiliateRate - taxRateDecimal;
        if (denominator > 0) {
            grandTotal = baseForPercentages / denominator;
            tax = grandTotal * taxRateDecimal;
        }
    }

    if (grandTotal < 0 || !isFinite(grandTotal)) grandTotal = 0;

    const miscCost = grandTotal * miscRate;
    const salaryCost = grandTotal * salaryRate;
    const percentageAffiliateCost = grandTotal * percentageAffiliateRate;

    const affiliateCost = fixedAffiliateCost + percentageAffiliateCost;
    const operationalCost = fixedOperationalCost + miscCost + salaryCost;
    const totalBaseCost = materialCost + laborCost + operationalCost + affiliateCost;
    
    const finalSubtotal = grandTotal - tax;
    const finalProfit = finalSubtotal - totalBaseCost;
    
    return {
      materialCost,
      laborCost,
      operationalCost,
      affiliateCost,
      miscCost,
      salaryCost,
      totalBaseCost,
      profit: finalProfit > 0 ? finalProfit : 0,
      subtotal: finalSubtotal,
      grandTotal,
      tax,
      taxRate: effectiveTaxRate,
      taxType,
      profitMargin: finalProfit > 0 && finalSubtotal > 0 ? (finalProfit / finalSubtotal) * 100 : 0,
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
                publishedQuotes: [],

                setFormValues: (values) => {
                    set({
                        formValues: values,
                        calculations: performCalculations(values),
                    });
                },

                setAllocations: (allocations) => {
                    set({ allocations });
                },

                publishQuote: (finalCalculations, suggestedCalculations) => {
                    const { formValues, allocations, publishedQuotes } = get();
                    const existingQuoteIndex = publishedQuotes.findIndex(q => q.id === formValues.clientName?.replace(/\s+/g, '-'));

                    if (existingQuoteIndex !== -1) {
                         set(state => ({
                            publishedQuotes: state.publishedQuotes.map((q, index) =>
                                index === existingQuoteIndex
                                ? { ...q,
                                    timestamp: Date.now(),
                                    formValues: JSON.parse(JSON.stringify(formValues)),
                                    allocations: JSON.parse(JSON.stringify(allocations)),
                                    calculations: JSON.parse(JSON.stringify(finalCalculations)),
                                    suggestedCalculations: JSON.parse(JSON.stringify(suggestedCalculations)),
                                  }
                                : q
                            ),
                        }));
                        return formValues.clientName!.replace(/\s+/g, '-');
                    }
                    
                    const nextId = `QT-${(publishedQuotes.length + 1).toString().padStart(3, '0')}`;
                    const newQuote: PublishedQuote = {
                        id: nextId,
                        timestamp: Date.now(),
                        clientName: formValues.clientName || 'Unnamed Client',
                        status: 'Draft',
                        formValues: JSON.parse(JSON.stringify(formValues)),
                        allocations: JSON.parse(JSON.stringify(allocations)),
                        calculations: JSON.parse(JSON.stringify(finalCalculations)),
                        suggestedCalculations: JSON.parse(JSON.stringify(suggestedCalculations)),
                    };
                    set({ publishedQuotes: [...publishedQuotes, newQuote] });
                    return nextId;
                },
                updateQuoteStatus: (id, status) => {
                    set(state => ({
                        publishedQuotes: state.publishedQuotes.map(q => 
                            q.id === id ? { ...q, status } : q
                        ),
                    }));
                },

                deleteQuote: (id) => {
                    set(state => ({
                        publishedQuotes: state.publishedQuotes.filter(q => q.id !== id),
                    }));
                },
                loadQuoteIntoForm: (id) => {
                    const quoteToLoad = get().publishedQuotes.find(q => q.id === id);
                    if (quoteToLoad) {
                        set({
                            formValues: quoteToLoad.formValues,
                            allocations: quoteToLoad.allocations,
                            calculations: quoteToLoad.calculations,
                        });
                    }
                }
            }),
            {
                name: "cost-store-storage",
                storage: createJSONStorage(() => localStorage), 
                partialize: (state) => ({ 
                    formValues: state.formValues, 
                    allocations: state.allocations,
                    publishedQuotes: state.publishedQuotes 
                }),
            }
        ),
        { name: "CostStore" }
    )
);

if (typeof window !== 'undefined') {
  useStore.persist.rehydrate();
}
