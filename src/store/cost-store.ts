
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

export type PublishedQuote = {
    id: string;
    timestamp: number;
    clientName: string;
    status: 'Draft' | 'Sent' | 'Approved' | 'Declined';
    formValues: FormValues;
    allocations: Allocation;
    calculations: Calculations;
}

interface CostState {
  formValues: FormValues;
  allocations: Allocation;
  calculations: Calculations;
  publishedQuotes: PublishedQuote[];
  setFormValues: (values: FormValues) => void;
  setAllocations: (allocations: Allocation) => void;
  publishQuote: () => string; // Returns the new quote ID
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
    
    let grandTotal = 0;
    let subtotal = 0;
    let tax = 0;
    let taxType = "VAT";
    let effectiveTaxRate = taxRate || 0;

    if (businessType === 'vat_registered') {
        taxType = "VAT";
        const denominator = 1 - miscDecimal - totalAffiliatePercentage - (profitMarginDecimal * (1 + miscDecimal + totalAffiliatePercentage));
        if (denominator > 0) {
            grandTotal = (totalFixedCosts / denominator) * (1 + (effectiveTaxRate / 100));
            subtotal = grandTotal / (1 + (effectiveTaxRate / 100));
            tax = grandTotal - subtotal;
        }

    } else { // sole_proprietor
        taxType = "TOT";
        effectiveTaxRate = 3;
        const denominator = 1 - miscDecimal - totalAffiliatePercentage - (profitMarginDecimal * (1 + miscDecimal + totalAffiliatePercentage));
        if (denominator > 0) {
            subtotal = totalFixedCosts / denominator;
            grandTotal = subtotal / (1 - (effectiveTaxRate / 100));
            tax = grandTotal - subtotal;
        }
    }
    
    if (grandTotal < 0 || !isFinite(grandTotal)) grandTotal = 0;
    if (subtotal < 0 || !isFinite(subtotal)) subtotal = 0;

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
      profit: profit > 0 ? profit : 0,
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

                publishQuote: () => {
                    const { formValues, allocations, calculations, publishedQuotes } = get();
                    const existingQuoteIndex = publishedQuotes.findIndex(q => q.id === formValues.clientName?.replace(/\s+/g, '-'));

                    if (existingQuoteIndex !== -1) {
                         set(state => ({
                            publishedQuotes: state.publishedQuotes.map((q, index) =>
                                index === existingQuoteIndex
                                ? { ...q,
                                    timestamp: Date.now(),
                                    formValues: JSON.parse(JSON.stringify(formValues)),
                                    allocations: JSON.parse(JSON.stringify(allocations)),
                                    calculations: JSON.parse(JSON.stringify(calculations)),
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
                        calculations: JSON.parse(JSON.stringify(calculations)),
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
