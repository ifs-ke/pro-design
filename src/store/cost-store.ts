
import { create } from 'zustand';
import type * as z from 'zod';
import type { formSchema } from '@/components/design/cost-form';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { createSelector } from 'reselect';
import { 
    upsertQuote as upsertQuoteAction,
    deleteQuote as deleteQuoteAction,
    assignQuoteToProject as assignQuoteToProjectAction,
    createClient as createClientAction,
    updateClient as updateClientAction,
    deleteClient as deleteClientAction,
    createProperty as createPropertyAction,
    updateProperty as updatePropertyAction,
    deleteProperty as deletePropertyAction,
    createProject as createProjectAction,
    updateProject as updateProjectAction,
    deleteProject as deleteProjectAction,
} from '@/lib/actions';

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
  nssfCost: number;
  shifCost: number;
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
export interface Interaction {
    id: string;
    type: 'Email' | 'Call' | 'Meeting' | 'Other';
    notes: string;
    timestamp: string;
}

export interface Client {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    status: 'Lead' | 'Active' | 'OnHold' | 'Inactive';
    responsiveness: 'Hot' | 'Warm' | 'Cold';
    createdAt: string;
    updatedAt: string;
    interactions: Interaction[];
}

export interface Property {
    id: string;
    name: string;
    clientId: string;
    address?: string;
    propertyType?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Project {
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
}

export interface Quote {
    id: string;
    clientId: string;
    projectId?: string | null;
    formValues: FormValues;
    allocations: Allocation;
    calculations: Calculations;
    suggestedCalculations: Calculations;
    status: 'Draft' | 'Sent' | 'Approved' | 'Declined';
    timestamp: string;
}

// Enriched types for client-side hydration with relationships
export interface HydratedClient extends Client {
    projects: HydratedProject[];
    quotes: HydratedQuote[];
    properties: HydratedProperty[];
}

export interface HydratedProperty extends Property {
    client?: Client;
    projects: HydratedProject[];
}

export interface HydratedProject extends Project {
    client?: Client;
    property?: Property;
    quotes: HydratedQuote[];
}

export interface HydratedQuote extends Quote {
    client?: Client;
    project?: Project;
}

export type DashboardMetrics = {
    totalClients: number;
    totalProjects: number;
    approvedRevenue: number;
    approvalRate: number;
    clientStatusData: { name: string; value: number }[];
    quoteStatusData: { name: string; value: number }[];
    projectStatusData: { name: string; value: number }[];
    totalApprovedQuotes: number;
    totalQuotes: number;
};

interface CostState {
  // Form state
  formValues: FormValues;
  allocations: Allocation;
  loadedQuoteId: string | null;
  _hydrated: boolean;
  
  // In-memory "database"
  clients: Client[];
  properties: Property[];
  projects: Project[];
  quotes: Quote[];

  // Hydrated data (derived state)
  hydratedClients: HydratedClient[];
  hydratedProperties: HydratedProperty[];
  hydratedProjects: HydratedProject[];
  hydratedQuotes: HydratedQuote[];

  // Data hydration action
  setData: (data: { clients: Client[], properties: Property[], projects: Project[], quotes: Quote[] }) => void;

  // Form actions
  setFormValues: (values: Partial<FormValues>) => void;
  setAllocations: (values: Allocation) => void;
  loadQuoteIntoForm: (quoteId: string) => void; 
  resetForm: () => void;
  setHydrated: () => void;

  // "DB" actions
  addClient: (data: { name: string; email?: string; phone?: string }) => Promise<Client>;
  updateClient: (id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addInteraction: (clientId: string, data: { type: Interaction['type']; notes: string }) => void;
  
  addProperty: (data: Partial<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Property>;
  updateProperty: (id: string, data: Partial<Omit<Property, 'id' | 'createdAt'>>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;

  addProject: (data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  publishQuote: (quoteId: string | null, formValues: FormValues, allocations: Allocation, finalCalculations: Calculations, suggestedCalculations: Calculations) => Promise<{ quoteId: string, wasExisting: boolean }>;
  updateQuoteStatus: (id: string, status: Quote['status']) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  assignQuoteToProject: (quoteId: string, projectId: string) => Promise<void>;
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
  enableNSSF: false,
  enableSHIF: false,
  grossSalary: 0,
};

const defaultAllocations: Allocation = {
  savings: 40,
  futureDev: 30,
  csr: 30,
};

export const performCalculations = (formValues: FormValues): Calculations => {
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
      numberOfPeople,
      enableNSSF,
      enableSHIF,
      grossSalary,
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
    const salaryCost = (materialCost + laborCost) * salaryRate;

    // --- Deductibles Calculation ---
    const numPeople = numberOfPeople || 0;
    const monthlyGrossSalary = grossSalary || 0;
    let nssfCost = 0;
    if (enableNSSF && monthlyGrossSalary > 0 && numPeople > 0) {
        const tier1Limit = 7000;
        const tier2Limit = 36000;
        const nssfRate = 0.06;

        const tier1Contribution = Math.min(monthlyGrossSalary, tier1Limit) * nssfRate;
        
        let tier2Contribution = 0;
        if (monthlyGrossSalary > tier1Limit) {
            const tier2Pensionable = Math.min(monthlyGrossSalary, tier2Limit) - tier1Limit;
            tier2Contribution = Math.max(0, tier2Pensionable) * nssfRate;
        }
        // Total employer contribution per person, multiplied by number of people
        nssfCost = (tier1Contribution + tier2Contribution) * numPeople;
    }

    let shifCost = 0;
    if (enableSHIF && monthlyGrossSalary > 0 && numPeople > 0) {
        const shifRate = 0.0275;
        shifCost = (monthlyGrossSalary * shifRate) * numPeople;
    }
    // --- End Deductibles ---


    const fixedCosts = materialCost + laborCost + fixedOperationalCost + fixedAffiliateCost + salaryCost + nssfCost + shifCost;
    
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
    
    const percentageRatesOnGross = miscRate + percentageAffiliateRate;

    if (businessType === 'vat_registered') {
        numerator = (1 + taxRateDecimal) * fixedCosts;
        denominator = (1 - profitMarginRate) - ((1 + taxRateDecimal) * percentageRatesOnGross);
    } else { // sole_proprietor or no_tax
        numerator = fixedCosts;
        denominator = ((1 - taxRateDecimal) * (1 - profitMarginRate)) - percentageRatesOnGross;
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
    const percentageAffiliateCost = grandTotal * percentageAffiliateRate;

    const affiliateCost = fixedAffiliateCost + percentageAffiliateCost;
    const operationalCost = fixedOperationalCost;
    const totalBaseCost = materialCost + laborCost + operationalCost + affiliateCost + miscCost + salaryCost + nssfCost + shifCost;
    
    const finalProfit = subtotal - totalBaseCost;
    
    return {
      materialCost,
      laborCost,
      operationalCost,
      affiliateCost,
      miscCost,
      salaryCost,
      nssfCost,
      shifCost,
      totalBaseCost,
      profit: finalProfit > 0 ? finalProfit : 0,
      subtotal: subtotal,
      grandTotal,
      tax,
      taxRate: effectiveTaxRate,
      taxType,
      profitMargin: finalProfit > 0 && subtotal > 0 ? (finalProfit / subtotal) * 100 : 0,
      businessType: formValues.businessType,
      numberOfPeople: formValues.numberOfPeople,
    };
}

// --- Centralized Selectors ---
const selectClients = (state: CostState) => state.clients;
const selectProjects = (state: CostState) => state.projects;
const selectProperties = (state: CostState) => state.properties;
const selectQuotes = (state: CostState) => state.quotes;

const selectHydratedQuotes = createSelector(
  [selectQuotes, selectClients, selectProjects],
  (quotes, clients, projects) => {
    const clientMap = new Map(clients.map(c => [c.id, c]));
    const projectMap = new Map(projects.map(p => [p.id, p]));
    return quotes.map(q => ({
      ...q,
      client: clientMap.get(q.clientId),
      project: q.projectId ? projectMap.get(q.projectId) : undefined,
    })).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
);

const selectHydratedProjects = createSelector(
  [selectProjects, selectClients, selectProperties, selectHydratedQuotes],
  (projects, clients, properties, hydratedQuotes) => {
    const clientMap = new Map(clients.map(c => [c.id, c]));
    const propertyMap = new Map(properties.map(p => [p.id, p]));
    return projects.map(p => ({
      ...p,
      client: clientMap.get(p.clientId),
      property: p.propertyId ? propertyMap.get(p.propertyId) : undefined,
      quotes: hydratedQuotes.filter(q => q.projectId === p.id),
    })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
);

const selectHydratedProperties = createSelector(
  [selectProperties, selectClients, selectHydratedProjects],
  (properties, clients, hydratedProjects) => {
    const clientMap = new Map(clients.map(c => [c.id, c]));
    return properties.map(p => ({
      ...p,
      client: clientMap.get(p.clientId),
      projects: hydratedProjects.filter(proj => proj.propertyId === p.id),
    })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
);

const selectHydratedClients = createSelector(
  [selectClients, selectHydratedProjects, selectHydratedQuotes, selectHydratedProperties],
  (clients, hydratedProjects, hydratedQuotes, hydratedProperties) => {
    return clients.map(c => ({
      ...c,
      projects: hydratedProjects.filter(p => p.clientId === c.id),
      quotes: hydratedQuotes.filter(q => q.clientId === c.id),
      properties: hydratedProperties.filter(p => p.clientId === c.id),
    })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
);


export const useStore = create<CostState>()(
  devtools(
    persist(
      (set, get) => ({
        formValues: defaultFormValues,
        allocations: defaultAllocations,
        loadedQuoteId: null,
        _hydrated: false,

        clients: [],
        properties: [],
        projects: [],
        quotes: [],

        // Initialize derived state
        hydratedClients: [],
        hydratedProperties: [],
        hydratedProjects: [],
        hydratedQuotes: [],
        
        setHydrated: () => {
            set({ _hydrated: true });
        },

        setData: (data) => {
            set(data);
        },

        setFormValues: (values) => {
            set(state => ({
                formValues: { ...state.formValues, ...values }
            }));
        },

        setAllocations: (values) => {
            set({ allocations: values });
        },

        loadQuoteIntoForm: (quoteId: string) => {
          const quote = get().quotes.find(q => q.id === quoteId);
          if (quote) {
            set({
              formValues: quote.formValues,
              allocations: quote.allocations,
              loadedQuoteId: quote.id,
            });
          }
        },
        resetForm: () => {
          set({
            formValues: defaultFormValues,
            allocations: defaultAllocations,
            loadedQuoteId: null,
          });
        },

        addClient: async (data) => {
            const newClient: Client = {
                ...data,
                id: crypto.randomUUID(),
                status: 'Lead',
                responsiveness: 'Warm',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                interactions: [],
            };
            set(state => ({ clients: [...state.clients, newClient] }));
            // This needs a form, so we can't call the action directly.
            // await createClientAction(newClient);
            return newClient;
        },
        updateClient: async (id, data) => {
            set(state => ({
                clients: state.clients.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c)
            }));
            // This needs a form, so we can't call the action directly.
            // const updatedClient = get().clients.find(c => c.id === id);
            // if (updatedClient) {
            //   await updateClientAction(id, updatedClient);
            // }
        },
        deleteClient: async (id) => {
            set(state => ({
                clients: state.clients.filter(c => c.id !== id),
                projects: state.projects.filter(p => p.clientId !== id),
                properties: state.properties.filter(p => p.clientId !== id),
                quotes: state.quotes.filter(q => q.clientId !== id),
            }));
            await deleteClientAction(id);
        },
        addInteraction: (clientId, data) => {
            const newInteraction: Interaction = { ...data, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
            set(state => ({
                clients: state.clients.map(c => c.id === clientId ? { ...c, interactions: [...(c.interactions || []), newInteraction].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) } : c)
            }));
        },

        addProperty: async (data) => {
            const newProperty: Property = {
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...data
            } as Property;
            set(state => ({ properties: [...state.properties, newProperty] }));
             // This needs a form, so we can't call the action directly.
            // await createPropertyAction(newProperty);
            return newProperty;
        },
        updateProperty: async (id, data) => {
            set(state => ({
                properties: state.properties.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)
            }));
             // This needs a form, so we can't call the action directly.
            // const updatedProperty = get().properties.find(p => p.id === id);
            // if (updatedProperty) {
            //   await updatePropertyAction(id, updatedProperty);
            // }
        },
        deleteProperty: async (id) => {
            set(state => ({
                properties: state.properties.filter(p => p.id !== id),
                projects: state.projects.map(p => p.propertyId === id ? { ...p, propertyId: undefined } : p)
            }));
            await deletePropertyAction(id);
        },

        addProject: async (data) => {
            const newProject: Project = {
                id: crypto.randomUUID(),
                status: 'Planning',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...data
            } as Project;
            set(state => ({ projects: [...state.projects, newProject] }));
            // This needs a form, so we can't call the action directly.
            // await createProjectAction(newProject);
            return newProject;
        },
        updateProject: async (id, data) => {
            set(state => ({
                projects: state.projects.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)
            }));
            // This needs a form, so we can't call the action directly.
            // const updatedProject = get().projects.find(p => p.id === id);
            // if (updatedProject) {
            //   await updateProjectAction(id, updatedProject);
            // }
        },
        deleteProject: async (id) => {
            set(state => ({
                projects: state.projects.filter(p => p.id !== id),
                quotes: state.quotes.map(q => q.projectId === id ? { ...q, projectId: null } : q)
            }));
            await deleteProjectAction(id);
        },

        publishQuote: async (quoteId, formValues, allocations, finalCalculations, suggestedCalculations) => {
            let quoteToSave: Quote;
            let wasExisting = false;

            if (quoteId) {
                const existingQuote = get().quotes.find(q => q.id === quoteId);
                if (!existingQuote) throw new Error("Quote not found");
                
                quoteToSave = {
                    ...existingQuote,
                    formValues,
                    allocations,
                    calculations: finalCalculations,
                    suggestedCalculations,
                    timestamp: new Date().toISOString(),
                    status: 'Draft',
                    clientId: formValues.clientId,
                    projectId: formValues.projectId || null,
                };
                wasExisting = true;
                set(state => ({
                    quotes: state.quotes.map(q => q.id === quoteId ? quoteToSave : q)
                }));
            } else {
                quoteToSave = {
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
                wasExisting = false;
                set(state => ({ quotes: [...state.quotes, quoteToSave] }));
            }

            await upsertQuoteAction(quoteToSave);

            return { quoteId: quoteToSave.id, wasExisting };
        },
        updateQuoteStatus: async (id, status) => {
            const quote = get().quotes.find(q => q.id === id);
            if (quote) {
                const updatedQuote = { ...quote, status: status as Quote['status'] };
                set(state => ({
                    quotes: state.quotes.map(q => q.id === id ? updatedQuote : q)
                }));
                await upsertQuoteAction(updatedQuote);
            }
        },
        deleteQuote: async (id: string) => {
            set(state => ({
                quotes: state.quotes.filter(q => q.id !== id)
            }));
            await deleteQuoteAction(id);
        },
        assignQuoteToProject: async (quoteId, projectId) => {
            set(state => ({
                quotes: state.quotes.map(q => q.id === quoteId ? { ...q, projectId } : q)
            }));
            await assignQuoteToProjectAction(quoteId, projectId);
        },
      }),
      {
        name: 'design-cost-pro-storage',
        storage: createJSONStorage(() => localStorage),
        merge: (persistedState, currentState) => {
          const state = persistedState as CostState;
          const hydratedState = {
            ...currentState,
            ...state,
            hydratedClients: selectHydratedClients(state),
            hydratedProperties: selectHydratedProperties(state),
            hydratedProjects: selectHydratedProjects(state),
            hydratedQuotes: selectHydratedQuotes(state),
          };
          return hydratedState;
        },
      }
    ),
    { name: "CostFormStore" }
  )
);

// Subscribe to store changes to update derived state
useStore.subscribe(
  (state) => {
    const newHydratedClients = selectHydratedClients(state);
    const newHydratedProperties = selectHydratedProperties(state);
    const newHydratedProjects = selectHydratedProjects(state);
    const newHydratedQuotes = selectHydratedQuotes(state);

    if (
      useStore.getState().hydratedClients !== newHydratedClients ||
      useStore.getState().hydratedProperties !== newHydratedProperties ||
      useStore.getState().hydratedProjects !== newHydratedProjects ||
      useStore.getState().hydratedQuotes !== newHydratedQuotes
    ) {
      useStore.setState({
        hydratedClients: newHydratedClients,
        hydratedProperties: newHydratedProperties,
        hydratedProjects: newHydratedProjects,
        hydratedQuotes: newHydratedQuotes,
      });
    }
  }
);
