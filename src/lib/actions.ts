
'use server'

import { useStore } from '@/store/cost-store';
import type { Allocation, Calculations, FormValues } from "@/store/cost-store";

// This is a server-side representation of what would be database actions.
// In this implementation, they will interact with the Zustand store via server-side logic,
// which is not the standard pattern but will work for this self-contained example.
// For a real app, these would be Prisma/Drizzle/etc. calls.

export async function getClients() {
  return useStore.getState().clients;
}

export async function createClient(data: { name: string; email?: string; phone?: string }) {
  const newClient = useStore.getState().addClient(data);
  return newClient;
}

export async function updateClient(id: string, data: any) {
  useStore.getState().updateClient(id, data);
}

export async function deleteClient(id: string) {
  useStore.getState().deleteClient(id);
}

export async function addInteraction(clientId: string, data: { type: any; notes: string }) {
    useStore.getState().addInteraction(clientId, data);
}

export async function getProperties() {
    return useStore.getState().properties;
}

export async function createProperty(data: any) {
    const newProperty = useStore.getState().addProperty(data);
    return newProperty;
}

export async function updateProperty(id: string, data: any) {
    useStore.getState().updateProperty(id, data);
}

export async function deleteProperty(id: string) {
    useStore.getState().deleteProperty(id);
}

export async function getProjects() {
    return useStore.getState().projects;
}

export async function createProject(data: any) {
    const newProject = useStore.getState().addProject(data);
    return newProject;
}

export async function updateProject(id: string, data: any) {
    useStore.getState().updateProject(id, data);
}

export async function deleteProject(id: string) {
    useStore.getState().deleteProject(id);
}

export async function getQuotes() {
  return useStore.getState().quotes;
}

export async function getQuoteById(id: string) {
    return useStore.getState().quotes.find(q => q.id === id) || null;
}


export async function publishQuote(
  quoteId: string | null,
  formValues: FormValues,
  allocations: Allocation,
  finalCalculations: Calculations,
  suggestedCalculations: Calculations
) {
  const result = useStore.getState().publishQuote(quoteId, formValues, allocations, finalCalculations, suggestedCalculations);
  return result;
}

export async function updateQuoteStatus(id: string, status: string) {
    useStore.getState().updateQuoteStatus(id, status);
}

export async function deleteQuote(id: string) {
    useStore.getState().deleteQuote(id);
}

export async function assignQuoteToProject(quoteId: string, projectId: string) {
    useStore.getState().assignQuoteToProject(quoteId, projectId);
}


export async function getDashboardMetrics() {
    const { clients, projects, quotes } = useStore.getState();

    const approvedQuotes = quotes.filter(q => q.status === 'Approved');
    const approvedRevenue = approvedQuotes.reduce((sum, q) => sum + (q.calculations as any).grandTotal, 0);
    const approvalRate = quotes.length > 0 ? (approvedQuotes.length / quotes.length) * 100 : 0;

    const clientStatusCounts: Record<string, number> = clients.reduce((acc: Record<string, number>, client) => {
        acc[client.status] = (acc[client.status] || 0) + 1;
        return acc;
    }, {});
    const clientStatusData = Object.entries(clientStatusCounts).map(([name, value]) => ({ name, value }));
    
    const quoteStatusCounts: Record<string, number> = quotes.reduce((acc: Record<string, number>, quote) => {
        acc[quote.status] = (acc[quote.status] || 0) + 1;
        return acc;
    }, {});
    const quoteStatusData = Object.entries(quoteStatusCounts).map(([name, value]) => ({ name, value }));

    const projectStatusCounts: Record<string, number> = projects.reduce((acc: Record<string, number>, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {});
    const projectStatusData = Object.entries(projectStatusCounts).map(([name, value]) => ({ name, value }));

    return {
      totalClients: clients.length,
      totalProjects: projects.length,
      approvedRevenue,
      approvalRate,
      clientStatusData,
      quoteStatusData,
      projectStatusData,
      totalApprovedQuotes: approvedQuotes.length,
      totalQuotes: quotes.length,
    };
}
