'use server'

import prisma from './prisma'
import { revalidatePath } from 'next/cache'
import type { Client, Project, Property, Quote } from '@prisma/client'
import type { Calculations, Allocation, FormValues } from '@/store/cost-store'

// CLIENT ACTIONS
export async function getClients() {
  return await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
        interactions: { orderBy: { timestamp: 'desc'}},
        projects: true,
        quotes: true,
    }
  })
}

export async function createClient(data: Pick<Client, 'name' | 'email' | 'phone'>) {
  const newClient = await prisma.client.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
    },
  })
  revalidatePath('/crm')
  revalidatePath('/costing')
  return newClient
}

export async function updateClient(id: string, data: Partial<Pick<Client, 'name' | 'email' | 'phone' | 'status' | 'responsiveness'>>) {
  await prisma.client.update({
    where: { id },
    data,
  })
  revalidatePath('/crm')
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } })
  revalidatePath('/crm')
}

export async function addInteraction(clientId: string, data: { type: any, notes: string }) {
    await prisma.interaction.create({
        data: {
            clientId,
            type: data.type,
            notes: data.notes
        }
    })
    revalidatePath('/crm');
}


// PROPERTY ACTIONS
export async function getProperties() {
    return await prisma.property.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            client: true,
            projects: true,
        }
    })
}

export async function createProperty(data: Pick<Property, 'name' | 'clientId' | 'address' | 'propertyType' | 'notes'>) {
    const newProperty = await prisma.property.create({ data });
    revalidatePath('/properties');
    revalidatePath('/projects');
    return newProperty;
}

export async function updateProperty(id: string, data: Partial<Pick<Property, 'name' | 'clientId' | 'address' | 'propertyType' | 'notes'>>) {
    await prisma.property.update({ where: { id }, data });
    revalidatePath('/properties');
}

export async function deleteProperty(id: string) {
    await prisma.property.delete({ where: { id } });
    revalidatePath('/properties');
    revalidatePath('/projects');
}


// PROJECT ACTIONS
export async function getProjects() {
    return await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            client: true,
            property: true,
            quotes: true,
        }
    });
}

export async function createProject(data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>> & Pick<Project, 'name'>) {
    const newProject = await prisma.project.create({
        data: {
            name: data.name,
            clientId: data.clientId,
            propertyId: data.propertyId,
            scope: data.scope,
            timeline: data.timeline,
            projectType: data.projectType,
            services: data.services,
            roomCount: data.roomCount,
            otherSpaces: data.otherSpaces,
            status: data.status || 'Planning',
        }
    });
    revalidatePath('/projects');
    revalidatePath('/quotes');
    return newProject;
}

export async function updateProject(id: string, data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>) {
    await prisma.project.update({ where: { id }, data });
    revalidatePath('/projects');
}

export async function deleteProject(id: string) {
    await prisma.project.delete({ where: { id } });
    revalidatePath('/projects');
    revalidatePath('/quotes');
}


// QUOTE ACTIONS
export async function getQuotes() {
  return await prisma.quote.findMany({
    orderBy: { timestamp: 'desc' },
    include: {
      client: true,
      project: true,
    }
  })
}

export async function getQuoteById(id: string) {
    return await prisma.quote.findUnique({
        where: { id },
        include: {
            client: true,
        }
    });
}

export async function publishQuote(
    quoteId: string | null,
    formValues: FormValues, 
    allocations: Allocation, 
    finalCalculations: Calculations, 
    suggestedCalculations: Calculations
) {
    const data = {
        clientId: formValues.clientId,
        projectId: formValues.projectId || null,
        formValues: formValues as any,
        allocations: allocations as any,
        calculations: finalCalculations as any,
        suggestedCalculations: suggestedCalculations as any,
    };

    if (quoteId) {
        const updatedQuote = await prisma.quote.update({
            where: { id: quoteId },
            data: { ...data, status: 'Draft' }, // Reset status on update
        });
        revalidatePath('/quotes');
        return { quoteId: updatedQuote.id, wasExisting: true };
    }
    
    const newQuote = await prisma.quote.create({ data });
    revalidatePath('/quotes');
    return { quoteId: newQuote.id, wasExisting: false };
}

export async function updateQuoteStatus(id: string, status: Quote['status']) {
    await prisma.quote.update({
        where: { id },
        data: { status },
    });
    revalidatePath('/quotes');
}

export async function deleteQuote(id: string) {
    await prisma.quote.delete({ where: { id } });
    revalidatePath('/quotes');
}

export async function assignQuoteToProject(quoteId: string, projectId: string) {
    await prisma.quote.update({
        where: { id: quoteId },
        data: { projectId },
    });
    revalidatePath('/quotes');
    revalidatePath('/projects');
}

// DASHBOARD METRICS
export async function getDashboardMetrics() {
    const [quotes, projects, clients] = await Promise.all([
        prisma.quote.findMany(),
        prisma.project.findMany(),
        prisma.client.findMany()
    ]);

    const approvedQuotes = quotes.filter(q => q.status === 'Approved');
    const approvedRevenue = approvedQuotes.reduce((sum, q) => sum + (q.calculations as any).grandTotal, 0);
    const approvalRate = quotes.length > 0 ? (approvedQuotes.length / quotes.length) * 100 : 0;

    const clientStatusCounts: Record<string, number> = clients.reduce((acc, client) => {
        acc[client.status] = (acc[client.status] || 0) + 1;
        return acc;
    }, {});
    const clientStatusData = Object.entries(clientStatusCounts).map(([name, value]) => ({ name, value }));
    
    const quoteStatusCounts: Record<string, number> = quotes.reduce((acc, quote) => {
        acc[quote.status] = (acc[quote.status] || 0) + 1;
        return acc;
    }, {});
    const quoteStatusData = Object.entries(quoteStatusCounts).map(([name, value]) => ({ name, value }));

    const projectStatusCounts: Record<string, number> = projects.reduce((acc, project) => {
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
