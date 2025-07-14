
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

type DashboardMetrics = {
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

interface HydratedData {
    clients: HydratedClient[];
    properties: HydratedProperty[];
    projects: HydratedProject[];
    quotes: HydratedQuote[];
    dashboardMetrics: DashboardMetrics;
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
  getHydratedData: () => HydratedData;


  // "DB" actions
  addClient: (data: { name: string; email?: string; phone?: string }) => Client;
  updateClient: (id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) => void;
  deleteClient: (id: string) => void;
  addInteraction: (clientId: string, data: { type: Interaction['type']; notes: string }) => void;
  
  addProperty: (data: Partial<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>>) => Property;
  updateProperty: (id: string, data: Partial<Omit<Property, 'id' | 'createdAt'>>) => void;
  deleteProperty: (id: string) => void;

  addProject: (data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>>) => Project;
  updateProject: (id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  deleteProject: (id: string) => void;

  publishQuote: (quoteId: string | null, formValues: FormValues, allocations: Allocation, finalCalculations: Calculations, suggestedCalculations: Calculations) => { quoteId: string, wasExisting: boolean };
  updateQuoteStatus: (id: string, status: Quote['status']) => void;
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
    
    const salaryRate = (numberOfPeople ?? 0) > 0 ? (salaryPercentage || 0) / 100 : 0;
    
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
    const operationalCost = fixedOperationalCost;
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

        getHydratedData: () => {
            const { clients, properties, projects, quotes } = get();
            
            const hydratedQuotes: HydratedQuote[] = quotes.map(q => ({
                ...q,
                client: clients.find(c => c.id === q.clientId),
                project: projects.find(p => p.id === q.projectId),
            })).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            const hydratedProjects: HydratedProject[] = projects.map(p => ({
                ...p,
                client: clients.find(c => c.id === p.clientId),
                property: properties.find(prop => prop.id === p.propertyId),
                quotes: hydratedQuotes.filter(q => q.projectId === p.id),
            })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const hydratedProperties: HydratedProperty[] = properties.map(p => ({
                ...p,
                client: clients.find(c => c.id === p.clientId),
                projects: hydratedProjects.filter(proj => proj.propertyId === p.id),
            })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            const hydratedClients: HydratedClient[] = clients.map(c => ({
                ...c,
                projects: hydratedProjects.filter(p => p.clientId === c.id),
                quotes: hydratedQuotes.filter(q => q.clientId === c.id),
                properties: hydratedProperties.filter(p => p.clientId === c.id),
            })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const approvedQuotes = quotes.filter(q => q.status === 'Approved');
            const approvedRevenue = approvedQuotes.reduce((sum, q) => sum + (q.calculations as any).grandTotal, 0);
            const approvalRate = quotes.length > 0 ? (approvedQuotes.length / quotes.length) * 100 : 0;
            const clientStatusCounts = clients.reduce((acc: Record<string, number>, client) => {
                acc[client.status] = (acc[client.status] || 0) + 1;
                return acc;
            }, {});
            const quoteStatusCounts = quotes.reduce((acc: Record<string, number>, quote) => {
                acc[quote.status] = (acc[quote.status] || 0) + 1;
                return acc;
            }, {});
            const projectStatusCounts = projects.reduce((acc: Record<string, number>, project) => {
                acc[project.status] = (acc[project.status] || 0) + 1;
                return acc;
            }, {});

            const dashboardMetrics: DashboardMetrics = {
              totalClients: clients.length,
              totalProjects: projects.length,
              approvedRevenue,
              approvalRate,
              clientStatusData: Object.entries(clientStatusCounts).map(([name, value]) => ({ name, value })),
              quoteStatusData: Object.entries(quoteStatusCounts).map(([name, value]) => ({ name, value })),
              projectStatusData: Object.entries(projectStatusCounts).map(([name, value]) => ({ name, value })),
              totalApprovedQuotes: approvedQuotes.length,
              totalQuotes: quotes.length,
            };

            return {
                clients: hydratedClients,
                properties: hydratedProperties,
                projects: hydratedProjects,
                quotes: hydratedQuotes,
                dashboardMetrics
            }
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

        addClient: (data) => {
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
            const newInteraction: Interaction = { ...data, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
            set(state => ({
                clients: state.clients.map(c => c.id === clientId ? { ...c, interactions: [...(c.interactions || []), newInteraction].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) } : c)
            }));
        },

        addProperty: (data) => {
            const newProperty: Property = {
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...data
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

        addProject: (data) => {
            const newProject: Project = {
                id: crypto.randomUUID(),
                status: 'Planning',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...data
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

        publishQuote: (quoteId, formValues, allocations, finalCalculations, suggestedCalculations) => {
            if (quoteId) {
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
                                status: 'Draft',
                                clientId: formValues.clientId,
                                projectId: formValues.projectId || null,
                            };
                            return updatedQuote;
                        }
                        return q;
                    })
                }));
                return { quoteId, wasExisting: true };
            } else {
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
        name: 'design-cost-pro-storage',
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          if (state) state.setHydrated();
        },
      }
    ),
    { name: "CostFormStore" }
  )
);
