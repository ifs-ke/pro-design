
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

export type Interaction = {
    id: string;
    timestamp: number;
    type: 'Email' | 'Call' | 'Meeting' | 'Other';
    notes: string;
}

export type ClientStatus = 'Lead' | 'Active' | 'On-Hold' | 'Inactive';
export type ResponsivenessStatus = 'Hot' | 'Warm' | 'Cold';

export type Client = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    createdAt: number;
    interactions: Interaction[];
    status: ClientStatus;
    responsiveness: ResponsivenessStatus;
}

export type PublishedQuote = {
    id: string;
    timestamp: number;
    clientId: string;
    status: 'Draft' | 'Sent' | 'Approved' | 'Declined';
    formValues: FormValues;
    allocations: Allocation;
    calculations: Calculations; // This is the FINAL calculation
    suggestedCalculations: Calculations; // This is the originally suggested calculation
    projectId?: string;
}

export type Project = {
    id: string;
    name: string;
    createdAt: number;
}

type ClientDataInput = Omit<Client, 'id' | 'createdAt' | 'interactions'>;

interface CostState {
  formValues: FormValues;
  allocations: Allocation;
  calculations: Calculations;
  clients: Client[];
  publishedQuotes: PublishedQuote[];
  projects: Project[];
  setFormValues: (values: FormValues) => void;
  setAllocations: (allocations: Allocation) => void;
  addClient: (clientData: Omit<ClientDataInput, 'status' | 'responsiveness'> & Partial<Pick<ClientDataInput, 'status' | 'responsiveness'>>) => Client;
  updateClient: (id: string, clientData: Partial<ClientDataInput>) => void;
  deleteClient: (id: string) => void;
  addInteraction: (clientId: string, interaction: Omit<Interaction, 'id' | 'timestamp'>) => void;
  publishQuote: (finalCalculations: Calculations, suggestedCalculations: Calculations) => string; // Returns the new quote ID
  updateQuoteStatus: (id: string, status: PublishedQuote['status']) => void;
  deleteQuote: (id: string) => void;
  loadQuoteIntoForm: (id: string) => void;
  createProject: (name: string) => Project;
  assignQuoteToProject: (quoteId: string, projectId: string) => void;
}

const defaultFormValues: FormValues = {
  clientId: '',
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
    };
}


export const useStore = create<CostState>()(
    devtools(
        persist(
            (set, get) => ({
                formValues: defaultFormValues,
                allocations: defaultAllocations,
                calculations: performCalculations(defaultFormValues),
                clients: [],
                publishedQuotes: [],
                projects: [],

                setFormValues: (values) => {
                    set({
                        formValues: values,
                        calculations: performCalculations(values),
                    });
                },

                setAllocations: (allocations) => {
                    set({ allocations });
                },

                addClient: (clientData) => {
                    const newClient: Client = {
                        name: clientData.name,
                        email: clientData.email,
                        phone: clientData.phone,
                        id: `CLT-${Date.now().toString()}`,
                        createdAt: Date.now(),
                        interactions: [],
                        status: clientData.status || 'Lead',
                        responsiveness: clientData.responsiveness || 'Warm',
                    };
                    set(state => ({ clients: [...state.clients, newClient] }));
                    return newClient;
                },

                updateClient: (id, clientData) => {
                    set(state => ({
                        clients: state.clients.map(c => c.id === id ? { ...c, ...clientData } : c)
                    }));
                },

                deleteClient: (id) => {
                    set(state => ({
                        clients: state.clients.filter(c => c.id !== id),
                    }));
                },
                
                addInteraction: (clientId, interaction) => {
                    const newInteraction: Interaction = {
                        ...interaction,
                        id: `INT-${Date.now()}`,
                        timestamp: Date.now(),
                    };
                    set(state => ({
                        clients: state.clients.map(c => 
                            c.id === clientId 
                                ? { ...c, interactions: [...c.interactions, newInteraction] } 
                                : c
                        ),
                    }));
                },

                publishQuote: (finalCalculations, suggestedCalculations) => {
                    const { formValues, allocations, publishedQuotes } = get();
                    const existingQuoteIndex = publishedQuotes.findIndex(q => q.id === formValues.clientId?.replace(/\s+/g, '-'));

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
                        return formValues.clientId!.replace(/\s+/g, '-');
                    }
                    
                    const nextId = `QT-${(publishedQuotes.length + 1).toString().padStart(3, '0')}`;
                    const newQuote: PublishedQuote = {
                        id: nextId,
                        timestamp: Date.now(),
                        clientId: formValues.clientId || '',
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
                },
                createProject: (name) => {
                    const { projects } = get();
                    const newProject: Project = {
                        id: `PROJ-${(projects.length + 1).toString().padStart(3, '0')}`,
                        name,
                        createdAt: Date.now(),
                    };
                    set({ projects: [...projects, newProject] });
                    return newProject;
                },
                assignQuoteToProject: (quoteId, projectId) => {
                    set(state => ({
                        publishedQuotes: state.publishedQuotes.map(q =>
                            q.id === quoteId ? { ...q, projectId } : q
                        ),
                    }));
                }
            }),
            {
                name: "cost-store-storage",
                storage: createJSONStorage(() => localStorage), 
                partialize: (state) => ({ 
                    formValues: state.formValues, 
                    allocations: state.allocations,
                    clients: state.clients,
                    publishedQuotes: state.publishedQuotes,
                    projects: state.projects
                }),
            }
        ),
        { name: "CostStore" }
    )
);

if (typeof window !== 'undefined') {
  useStore.persist.rehydrate();
}
