
import { create } from 'zustand';
import type * as z from 'zod';
import type { formSchema } from '@/components/design/cost-form';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

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

// Define types for our in-memory "database"
interface Client {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    status: 'Lead' | 'Active' | 'OnHold' | 'Inactive';
    responsiveness: 'Hot' | 'Warm' | 'Cold';
    createdAt: string;
    updatedAt: string;
    interactions: Interaction[];
    projects: Project[];
    quotes: Quote[];
}

interface Interaction {
    id: string;
    type: 'Email' | 'Call' | 'Meeting' | 'Other';
    notes: string;
    timestamp: string;
}

interface Property {
    id: string;
    name: string;
    clientId: string;
    address?: string;
    propertyType?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    client?: Client;
    projects?: Project[];
}

interface Project {
    id: string;
    name: string;
    clientId: string;
    propertyId?: string;
    scope?: string;
    timeline?: string;
    projectType?: string;
    services?: string;
    roomCount?: number;
    otherSpaces?: string;
    status: 'Planning' | 'InProgress' | 'Completed' | 'OnHold' | 'Cancelled';
    createdAt: string;
    updatedAt: string;
    client?: Client;
    property?: Property;
    quotes?: Quote[];
}

interface Quote {
    id: string;
    clientId: string;
    projectId?: string | null;
    formValues: FormValues;
    allocations: Allocation;
    calculations: Calculations;
    suggestedCalculations: Calculations;
    status: 'Draft' | 'Sent' | 'Approved' | 'Declined';
    timestamp: string;
    client?: Client;
    project?: Project;
}


interface CostState {
  // Form state
  formValues: FormValues;
  allocations: Allocation;
  calculations: Calculations;
  loadedQuoteId: string | null;
  _hydrated: boolean;
  
  // In-memory "database"
  clients: Client[];
  properties: Property[];
  projects: Project[];
  quotes: Quote[];

  // Form actions
  setFormValues: (values: FormValues) => void;
  setAllocations: (allocations: Allocation) => void;
  loadQuoteIntoForm: (quoteId: string) => void; 
  resetForm: () => void;
  setHydrated: () => void;

  // "DB" actions
  addClient: (data: { name: string; email?: string; phone?: string }) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addInteraction: (clientId: string, data: { type: any; notes: string }) => void;
  
  addProperty: (data: Partial<Property>) => Property;
  updateProperty: (id: string, data: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  addProject: (data: Partial<Project>) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  publishQuote: (quoteId: string | null, formValues: FormValues, allocations: Allocation, finalCalculations: Calculations, suggestedCalculations: Calculations) => { quoteId: string, wasExisting: boolean };
  updateQuoteStatus: (id: string, status: string) => void;
  deleteQuote: (id: string) => void;
  assignQuoteToProject: (quoteId: string, projectId: string) => void;
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
      (set, get) => ({
        formValues: defaultFormValues,
        allocations: defaultAllocations,
        calculations: performCalculations(defaultFormValues),
        loadedQuoteId: null,
        _hydrated: false,

        // In-memory "database"
        clients: [],
        properties: [],
        projects: [],
        quotes: [],

        setFormValues: (values) => {
          set({
            formValues: values,
            calculations: performCalculations(values),
          });
        },

        setAllocations: (allocations) => {
          set({ allocations });
        },
        
        setHydrated: () => {
            set({ _hydrated: true });
        },

        loadQuoteIntoForm: (quoteId: string) => {
          const quote = get().quotes.find(q => q.id === quoteId);
          if (quote) {
            set({
              formValues: quote.formValues,
              allocations: quote.allocations,
              calculations: performCalculations(quote.formValues),
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

        // Client actions
        addClient: (data) => {
            const newClient: Client = {
                ...data,
                id: crypto.randomUUID(),
                status: 'Lead',
                responsiveness: 'Warm',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                interactions: [],
                projects: [],
                quotes: [],
            };
            set(state => ({ clients: [...state.clients, newClient] }));
            return newClient;
        },
        updateClient: (id, data) => {
            set(state => ({
                clients: state.clients.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c)
            }));
        },
        deleteClient: (id) => {
            set(state => ({
                clients: state.clients.filter(c => c.id !== id),
                projects: state.projects.filter(p => p.clientId !== id),
                properties: state.properties.filter(p => p.clientId !== id),
                quotes: state.quotes.filter(q => q.clientId !== id),
            }));
        },
        addInteraction: (clientId, data) => {
            const newInteraction = { ...data, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
            set(state => ({
                clients: state.clients.map(c => c.id === clientId ? { ...c, interactions: [...(c.interactions || []), newInteraction] } : c)
            }));
        },

        // Property actions
        addProperty: (data) => {
            const newProperty: Property = {
                ...data,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            } as Property;
            set(state => ({ properties: [...state.properties, newProperty] }));
            return newProperty;
        },
        updateProperty: (id, data) => {
            set(state => ({
                properties: state.properties.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)
            }));
        },
        deleteProperty: (id) => {
            set(state => ({
                properties: state.properties.filter(p => p.id !== id),
                projects: state.projects.map(p => p.propertyId === id ? { ...p, propertyId: undefined } : p)
            }));
        },

        // Project actions
        addProject: (data) => {
            const newProject: Project = {
                ...data,
                id: crypto.randomUUID(),
                status: 'Planning',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            } as Project;
            set(state => ({ projects: [...state.projects, newProject] }));
            return newProject;
        },
        updateProject: (id, data) => {
            set(state => ({
                projects: state.projects.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)
            }));
        },
        deleteProject: (id) => {
            set(state => ({
                projects: state.projects.filter(p => p.id !== id),
                quotes: state.quotes.map(q => q.projectId === id ? { ...q, projectId: null } : q)
            }));
        },

        // Quote actions
        publishQuote: (quoteId, formValues, allocations, finalCalculations, suggestedCalculations) => {
            if (quoteId) { // Update existing
                let updatedQuote: Quote | null = null;
                set(state => ({
                    quotes: state.quotes.map(q => {
                        if (q.id === quoteId) {
                            updatedQuote = {
                                ...q,
                                formValues,
                                allocations,
                                calculations: finalCalculations,
                                suggestedCalculations,
                                timestamp: new Date().toISOString(),
                                status: 'Draft'
                            };
                            return updatedQuote;
                        }
                        return q;
                    })
                }));
                return { quoteId, wasExisting: true };
            } else { // Create new
                const newQuote: Quote = {
                    id: `QT-${Date.now().toString().slice(-6)}`,
                    clientId: formValues.clientId,
                    projectId: formValues.projectId || null,
                    formValues,
                    allocations,
                    calculations: finalCalculations,
                    suggestedCalculations,
                    status: 'Draft',
                    timestamp: new Date().toISOString(),
                };
                set(state => ({ quotes: [...state.quotes, newQuote] }));
                return { quoteId: newQuote.id, wasExisting: false };
            }
        },
        updateQuoteStatus: (id, status) => {
            set(state => ({
                quotes: state.quotes.map(q => q.id === id ? { ...q, status: status as Quote['status'] } : q)
            }));
        },
        deleteQuote: (id) => {
            set(state => ({
                quotes: state.quotes.filter(q => q.id !== id)
            }));
        },
        assignQuoteToProject: (quoteId, projectId) => {
            set(state => ({
                quotes: state.quotes.map(q => q.id === quoteId ? { ...q, projectId } : q)
            }));
        },
      }),
      {
        name: 'cost-form-storage', 
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({ 
            formValues: state.formValues,
            allocations: state.allocations,
            loadedQuoteId: state.loadedQuoteId,
            clients: state.clients,
            properties: state.properties,
            projects: state.projects,
            quotes: state.quotes,
        }),
        onRehydrateStorage: () => (state) => {
            if (state) state.setHydrated();
        },
      }
    ),
    { name: "CostFormStore" }
  )
);

// This function is kept for conceptual linking, but client components will use the hook.
const getHydratedState = () => {
    const state = useStore.getState();
    const clients = state.clients.map(c => ({
        ...c,
        projects: state.projects.filter(p => p.clientId === c.id),
        quotes: state.quotes.filter(q => q.clientId === c.id),
        interactions: c.interactions || []
    }));

    const projects = state.projects.map(p => ({
        ...p,
        client: state.clients.find(c => c.id === p.clientId),
        property: state.properties.find(prop => prop.id === p.propertyId),
        quotes: state.quotes.filter(q => q.projectId === p.id)
    }));
    
    const properties = state.properties.map(p => ({
        ...p,
        client: state.clients.find(c => c.id === p.clientId),
        projects: state.projects.filter(proj => proj.propertyId === p.id)
    }));

    const quotes = state.quotes.map(q => ({
        ...q,
        client: state.clients.find(c => c.id === q.clientId),
        project: state.projects.find(p => p.id === q.projectId)
    }));
    
    return { ...state, clients, projects, properties, quotes };
};

// Add the function to the store's state for server-side usage if needed.
useStore.setState({ getHydratedState });
