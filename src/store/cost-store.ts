
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { createSelector } from 'reselect';
import {
    upsertQuote as upsertQuoteAction,
    deleteQuote as deleteQuoteAction,
    assignQuoteToProject as assignQuoteToProjectAction,
    upsertClient as upsertClientAction,
    deleteClient as deleteClientAction,
    upsertProperty as upsertPropertyAction,
    deleteProperty as deletePropertyAction,
    upsertProject as upsertProjectAction, 
    deleteProject as deleteProjectAction,
} from '@/lib/actions';
import { Client, Project, Property, Quote, Interaction, FormValues, Allocation, Calculations, HydratedClient, HydratedProperty, HydratedProject, HydratedQuote, Material, QuoteStatus } from './types'; 

export type { FormValues, Material, Calculations, Client, Project, Property, Quote, Interaction, Allocation, HydratedClient, HydratedProperty, HydratedProject, HydratedQuote, QuoteStatus };

const objectToFormData = (obj: Record<string, any>): FormData => {
    const formData = new FormData();
    for (const key in obj) {
        if (obj[key] !== undefined && obj[key] !== null) {
            formData.append(key, obj[key].toString());
        }
    }
    return formData;
};

const defaultFormValues: FormValues = {
  clientId: '',
  projectId: '',
  materials: [],
  labor: [],
  operations: [],
  affiliates: [],
  salaries: [],
  businessType: "vat_registered",
  taxRate: 16,
  profitMargin: 25,
  miscPercentage: 0,
  salaryPercentage: 0,
  enableNSSF: false,
  enableSHIF: false,
};

const defaultAllocations: Allocation = {
  savings: 40,
  futureDev: 30,
  csr: 30,
};

interface CostState {
  formValues: FormValues;
  allocations: Allocation;
  loadedQuoteId: string | null;
  isPublishing: boolean;
  _hydrated: boolean;
  clients: Client[];
  properties: Property[];
  projects: Project[];
  quotes: Quote[];
  hydratedClients: HydratedClient[];
  hydratedProperties: HydratedProperty[];
  hydratedProjects: HydratedProject[];
  hydratedQuotes: HydratedQuote[];
  setData: (data: { clients: Client[], properties: Property[], projects: Project[], quotes: Quote[] }) => void;
  setFormValues: (values: Partial<FormValues>) => void;
  setAllocations: (values: Allocation) => void;
  calculate: (formValues: FormValues) => Calculations;
  loadQuoteIntoForm: (quoteId: string) => void; 
  resetForm: () => void;
  setHydrated: () => void;
  setIsPublishing: (isPublishing: boolean) => void;
  saveClient: (data: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'interactions'>>) => Promise<Client | null>;
  deleteClient: (id: string) => Promise<void>;
  addInteraction: (clientId: string, data: { type: Interaction['type']; notes: string }) => void;
  saveProperty: (data: Partial<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>> & { id?: string }) => Promise<Property | null>;
  deleteProperty: (id: string) => Promise<void>;
  saveProject: (data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>> & { id?: string }) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;
  publishQuote: (formValues: FormValues, allocations: Allocation, finalCalculations: Calculations, suggestedCalculations: Calculations, loadedQuoteId: string | null) => Promise<{ quoteId: string, wasExisting: boolean } | null>;
  updateQuoteStatus: (id: string, status: QuoteStatus) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  assignQuoteToProject: (quoteId: string, projectId: string) => Promise<void>;
}

type RawStateForHydration = {
    clients: Client[];
    projects: Project[];
    properties: Property[];
    quotes: Quote[];
};

const selectHydratedQuotesInternal = createSelector(
  (s: RawStateForHydration) => s.quotes,
  (s: RawStateForHydration) => s.clients,
  (s: RawStateForHydration) => s.projects,
  (quotes, clients, projects): HydratedQuote[] => {
    const clientMap = new Map(clients.map(c => [c.id, c]));
    const projectMap = new Map(projects.map(p => [p.id, p]));
    return quotes.map(q => ({
      ...q,
      client: clientMap.get(q.clientId),
      project: q.projectId ? projectMap.get(q.projectId) : undefined,
    })).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
);

const selectHydratedProjectsInternal = createSelector(
  (s: RawStateForHydration) => s.projects,
  (s: RawStateForHydration) => s.clients,
  (s: RawStateForHydration) => s.properties,
  selectHydratedQuotesInternal,
  (projects, clients, properties, hydratedQuotes): HydratedProject[] => {
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

const selectHydratedPropertiesInternal = createSelector(
  (s: RawStateForHydration) => s.properties,
  (s: RawStateForHydration) => s.clients,
  selectHydratedProjectsInternal,
  (properties, clients, hydratedProjects): HydratedProperty[] => {
    const clientMap = new Map(clients.map(c => [c.id, c]));
    return properties.map(p => ({
      ...p,
      client: clientMap.get(p.clientId),
      projects: hydratedProjects.filter(proj => proj.propertyId === p.id),
    })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
);

const selectHydratedClientsInternal = createSelector(
  (s: RawStateForHydration) => s.clients,
  selectHydratedProjectsInternal,
  selectHydratedQuotesInternal,
  selectHydratedPropertiesInternal,
  (clients, hydratedProjects, hydratedQuotes, hydratedProperties): HydratedClient[] => {
    return clients.map(c => ({
      ...c,
      projects: hydratedProjects.filter(p => p.clientId === c.id),
      quotes: hydratedQuotes.filter(q => q.clientId === c.id),
      properties: hydratedProperties.filter(p => p.clientId === c.id),
    })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
);

const computeAndSetHydratedState = (state: CostState | RawStateForHydration) => {
    const rawState = {
        clients: state.clients,
        properties: state.properties,
        projects: state.projects,
        quotes: state.quotes,
    };
    const hydratedQuotes = selectHydratedQuotesInternal(rawState);
    const hydratedProjects = selectHydratedProjectsInternal(rawState);
    const hydratedProperties = selectHydratedPropertiesInternal(rawState);
    const hydratedClients = selectHydratedClientsInternal(rawState);

    return { hydratedQuotes, hydratedProjects, hydratedProperties, hydratedClients };
};

export const useStore = create<CostState>()(
  devtools(
    persist(
      (set, get) => ({
            formValues: defaultFormValues,
            allocations: defaultAllocations,
            loadedQuoteId: null,
            isPublishing: false,
            _hydrated: false,
            clients: [],
            properties: [],
            projects: [],
            quotes: [],
            hydratedClients: [],
            hydratedProperties: [],
            hydratedProjects: [],
            hydratedQuotes: [],
            
            setHydrated: () => set({ _hydrated: true }),
            setIsPublishing: (isPublishing) => set({ isPublishing }),

            setData: (data) => set(state => {
                const newState = { ...state, ...data };
                return { ...newState, ...computeAndSetHydratedState(newState) };
            }),

            setFormValues: (values) => set(state => ({ formValues: { ...state.formValues, ...values } })),
            setAllocations: (values) => set({ allocations: values }),

            calculate: (formValues) => {
                const businessType = formValues.businessType;
                const taxRate = Number(formValues.taxRate) || 0;
                const profitMargin = Number(formValues.profitMargin) || 0;
                const miscPercentage = Number(formValues.miscPercentage) || 0;
                const salaryPercentage = Number(formValues.salaryPercentage) || 0;

                const totalMaterialCost = formValues.materials?.reduce((acc, item) => acc + (Number(item.quantity) * (Number(item.cost) || 0)), 0) || 0;
                const totalLaborCost = formValues.labor?.reduce((acc, item) => acc + (Number(item.units) * Number(item.rate)), 0) || 0;
                const totalOperationCost = formValues.operations?.reduce((acc, item) => acc + Number(item.cost), 0) || 0;
                
                const directCostBase = totalMaterialCost + totalLaborCost + totalOperationCost;

                const totalGrossSalary = formValues.salaries?.reduce((acc, s) => acc + Number(s.salary), 0) || 0;
                const nssfAmount = formValues.enableNSSF ? (totalGrossSalary * 0.06) : 0;
                const shifAmount = formValues.enableSHIF ? (totalGrossSalary * 0.0275) : 0;
                const salaryAsPercentageAmount = (salaryPercentage / 100) * directCostBase;
                const salaryAmount = salaryAsPercentageAmount + totalGrossSalary + nssfAmount + shifAmount;

                const totalAffiliateCost = formValues.affiliates?.reduce((acc, item) => {
                    const rate = Number(item.rate) || 0;
                    if (item.rateType === 'percentage') { 
                        return acc + ((rate / 100) * directCostBase);
                    } else { // Fixed rate
                        return acc + (Number(item.units) * rate);
                    }
                }, 0) || 0;

                const subtotal = directCostBase + salaryAmount + totalAffiliateCost;

                const miscAmount = (miscPercentage / 100) * subtotal;
                const subtotalWithMisc = subtotal + miscAmount;
                const taxAmount = businessType === 'vat_registered' ? (taxRate / 100) * subtotalWithMisc : 0;
                const totalCost = subtotalWithMisc + taxAmount;
                const profitAmount = (profitMargin / 100) * totalCost;
                const totalPrice = totalCost + profitAmount;

                return {
                    totalMaterialCost,
                    totalLaborCost,
                    totalOperationCost,
                    totalAffiliateCost,
                    subtotal,
                    miscAmount,
                    subtotalWithMisc,
                    taxAmount,
                    totalCost,
                    profitAmount,
                    totalPrice,
                    salaryAmount,
                    nssfAmount,
                    shifAmount,
                };
            },

            loadQuoteIntoForm: (quoteId) => {
              const quote = get().quotes.find(q => q.id === quoteId);
              if (quote) {
                set({
                  formValues: quote.formValues,
                  allocations: quote.allocations,
                  loadedQuoteId: quote.id,
                });
              }
            },

            resetForm: () => set({
                formValues: defaultFormValues,
                allocations: defaultAllocations,
                loadedQuoteId: null,
            }),

            saveProject: async (data) => {
                const formData = objectToFormData(data);
                const result = await upsertProjectAction(null, formData);

                if (result.type === 'success' && result.project) {
                    const { client, property, ...plainProject } = result.project;

                    set(state => {
                        const newProjects = [...state.projects.filter(p => p.id !== plainProject.id), plainProject];
                        const newClients = client ? [...state.clients.filter(c => c.id !== client.id), client] : state.clients;
                        const newProperties = property ? [...state.properties.filter(p => p.id !== property.id), property] : state.properties;
                        
                        const newState = { ...state, projects: newProjects, clients: newClients, properties: newProperties };
                        return { ...newState, ...computeAndSetHydratedState(newState) };
                    });
                    return plainProject as Project;
                } else {
                    console.error('Server action failed: saveProject', result.message);
                    return null;
                }
            },

            deleteProject: async (id) => {
                const originalState = get();
                set(state => {
                    const newState = {
                        ...state,
                        projects: state.projects.filter(p => p.id !== id),
                        quotes: state.quotes.map(q => q.projectId === id ? { ...q, projectId: null } : q)
                    };
                    return { ...newState, ...computeAndSetHydratedState(newState) };
                });
                
                try {
                    const result = await deleteProjectAction(id);
                    if (result.type === 'error') throw new Error(result.message);
                } catch (error) {
                    console.error('Server action failed: deleteProject. Reverting.', error);
                    set(originalState);
                }
            },

            saveClient: async (data) => {
                const formData = objectToFormData(data);
                const result = await upsertClientAction(data.id || null, formData);

                if (result.type === 'success' && result.client) {
                    const savedClient = result.client;
                    set(state => {
                        const clients = state.clients.filter(c => c.id !== savedClient.id);
                        const newState = { ...state, clients: [...clients, savedClient] };
                        return { ...newState, ...computeAndSetHydratedState(newState) };
                    });
                    return savedClient;
                } else {
                    console.error('Server action failed: saveClient', result.message);
                    return null;
                }
            },
            
            deleteClient: async (id: string) => {
                 const originalState = get();
                 set(state => {
                    const newState = {
                        ...state,
                        clients: state.clients.filter(c => c.id !== id),
                        projects: state.projects.filter(p => p.clientId !== id),
                        properties: state.properties.filter(p => p.clientId !== id),
                        quotes: state.quotes.filter(q => q.clientId !== id),
                    };
                    return { ...newState, ...computeAndSetHydratedState(newState) };
                });

                try {
                    const result = await deleteClientAction(id);
                    if (result.type === 'error') throw new Error(result.message);
                } catch (error) {
                    console.error('Server action failed: deleteClient. Reverting.', error);
                    set(originalState);
                }
            },
            
            addInteraction: (clientId, data) => {
                const newInteraction: Interaction = { ...data, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
                set(state => {
                    const newState = {
                         ...state,
                         clients: state.clients.map(c => 
                            c.id === clientId 
                                ? { ...c, interactions: [...(c.interactions || []), newInteraction].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) } 
                                : c
                         )
                    };
                    return { ...newState, ...computeAndSetHydratedState(newState) };
                });
            },

            saveProperty: async (data) => {
                const formData = objectToFormData(data);
                const result = await upsertPropertyAction(data.id || null, formData);

                if (result.type === 'success' && result.property) {
                    const savedProperty = result.property;
                    set(state => {
                        const properties = state.properties.filter(p => p.id !== savedProperty.id);
                        const newState = { ...state, properties: [...properties, savedProperty] };
                        return { ...newState, ...computeAndSetHydratedState(newState) };
                    });
                    return savedProperty;
                } else {
                    console.error('Server action failed: saveProperty', result.message);
                    return null;
                }
            },

            deleteProperty: async (id) => {
                 const originalState = get();
                 set(state => {
                    const newState = {
                        ...state,
                        properties: state.properties.filter(p => p.id !== id),
                        projects: state.projects.map(p => p.propertyId === id ? { ...p, propertyId: undefined } : p)
                    };
                    return { ...newState, ...computeAndSetHydratedState(newState) };
                });
                try {
                    const result = await deletePropertyAction(id);
                    if (result.type === 'error') throw new Error(result.message);
                } catch (error) {
                    console.error('Server action failed: deleteProperty. Reverting.', error);
                    set(originalState);
                }
            },
            
            publishQuote: async (formValues, allocations, finalCalculations, suggestedCalculations, loadedQuoteId) => {
                set({ isPublishing: true });

                try {
                    const quoteToSave: any = {
                        formValues,
                        allocations,
                        calculations: finalCalculations,
                        suggestedCalculations,
                        timestamp: new Date().toISOString(),
                        status: 'Draft' as const,
                        clientId: formValues.clientId,
                        projectId: formValues.projectId || null,
                    };
                    if (loadedQuoteId) quoteToSave.id = loadedQuoteId;

                    const result = await upsertQuoteAction(quoteToSave);

                    if (result.type === 'success' && result.quote) {
                        const savedQuote = result.quote as Quote;
                        set(state => {
                            const quotes = state.quotes.filter(q => q.id !== savedQuote.id);
                            const newState = { 
                                ...state, 
                                quotes: [...quotes, savedQuote],
                                loadedQuoteId: savedQuote.id,
                                formValues: savedQuote.formValues,
                                allocations: savedQuote.allocations,
                            };
                            return { ...newState, ...computeAndSetHydratedState(newState) };
                        });
                        return { quoteId: savedQuote.id, wasExisting: !!loadedQuoteId };
                    } else {
                        console.error('Server action failed: publishQuote', result.message);
                        return null;
                    }
                } finally {
                    set({ isPublishing: false });
                }
            },

            updateQuoteStatus: async (id, status) => {
                const quote = get().quotes.find(q => q.id === id);
                if (!quote) return;

                const updatedQuote = { ...quote, status };

                // Optimistic update
                const originalQuotes = get().quotes;
                set(state => {
                    const newQuotes = state.quotes.map(q => (q.id === id ? updatedQuote : q));
                    const newState = { ...state, quotes: newQuotes };
                    return { ...newState, ...computeAndSetHydratedState(newState) };
                });

                try {
                    const result = await upsertQuoteAction(updatedQuote);
                    if (result.type === 'error') throw new Error(result.message);
                    // The optimistic update is already applied
                } catch (error) {
                    console.error('Failed to update quote status, rolling back', error);
                    // Rollback on error
                    set(state => {
                         const newState = { ...state, quotes: originalQuotes };
                         return { ...newState, ...computeAndSetHydratedState(newState) };
                    });
                }
            },

            deleteQuote: async (id) => {
                const result = await deleteQuoteAction(id);
                 if (result.type === 'success') {
                    set(state => {
                        const newState = { ...state, quotes: state.quotes.filter(q => q.id !== id) };
                        return { ...newState, ...computeAndSetHydratedState(newState) };
                    });
                }
            },
            assignQuoteToProject: async (quoteId, projectId) => {
                const result = await assignQuoteToProjectAction(quoteId, projectId);
                if (result.type === 'success' && result.quote) {
                     set(state => {
                        const newState = { ...state, quotes: state.quotes.map(q => q.id === quoteId ? result.quote as Quote : q) };
                        return { ...newState, ...computeAndSetHydratedState(newState) };
                    });
                }
            },
        }),
      {
        name: 'design-cost-pro-storage',
        storage: createJSONStorage(() => localStorage),
        merge: (persistedState, currentState) => {
            const state = { ...currentState, ...(persistedState as object) };
            if (state._hydrated) {
                const hydratedPart = computeAndSetHydratedState(state);
                return { ...state, ...hydratedPart };
            }
            return state;
        },
      }
    ),
    { name: "CostFormStore" }
  )
);
