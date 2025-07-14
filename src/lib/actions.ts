
'use server'

import { db } from './firebase'
import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import type { Allocation, Calculations, FormValues } from '@/store/cost-store'

// Type helpers
type DocumentWithId<T> = T & { id: string }

const convertTimestamp = (doc: any) => {
  const data = doc.data()
  for (const key in data) {
    if (data[key] instanceof FieldValue && data[key].isEqual(FieldValue.serverTimestamp())) {
       data[key] = new Date().toISOString()
    } else if (data[key]?.toDate) { // Convert Firestore Timestamps to ISO strings
       data[key] = data[key].toDate().toISOString()
    }
  }
  return { id: doc.id, ...data }
}

// CLIENT ACTIONS
export async function getClients() {
  const snapshot = await db.collection('clients').orderBy('createdAt', 'desc').get()
  const clients = snapshot.docs.map(doc => convertTimestamp(doc));
  
  for (const client of clients) {
      const interactionsSnapshot = await db.collection('clients').doc(client.id).collection('interactions').orderBy('timestamp', 'desc').get();
      client.interactions = interactionsSnapshot.docs.map(doc => convertTimestamp(doc));

      const projectsSnapshot = await db.collection('projects').where('clientId', '==', client.id).get();
      client.projects = projectsSnapshot.docs.map(doc => convertTimestamp(doc));

      const quotesSnapshot = await db.collection('quotes').where('clientId', '==', client.id).get();
      client.quotes = quotesSnapshot.docs.map(doc => convertTimestamp(doc));
  }
  return clients;
}

export async function createClient(data: { name: string; email?: string; phone?: string }) {
  const newClientRef = db.collection('clients').doc()
  await newClientRef.set({
    ...data,
    status: 'Lead',
    responsiveness: 'Warm',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  revalidatePath('/crm')
  revalidatePath('/costing')
  const newClient = await newClientRef.get();
  return convertTimestamp(newClient);
}

export async function updateClient(id: string, data: { name?: string; email?: string; phone?: string; status?: string; responsiveness?: string }) {
  await db.collection('clients').doc(id).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  })
  revalidatePath('/crm')
}

export async function deleteClient(id: string) {
  // This is a simple delete. For a real app, you might want to handle this in a transaction
  // or a Cloud Function to ensure atomicity of deleting related data.
  const projectsSnapshot = await db.collection('projects').where('clientId', '==', id).get();
  const batch = db.batch();
  projectsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  
  const quotesSnapshot = await db.collection('quotes').where('clientId', '==', id).get();
  quotesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

  const propertiesSnapshot = await db.collection('properties').where('clientId', '==', id).get();
  propertiesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

  batch.delete(db.collection('clients').doc(id));
  await batch.commit();

  revalidatePath('/crm')
  revalidatePath('/projects')
  revalidatePath('/quotes')
  revalidatePath('/properties')
}

export async function addInteraction(clientId: string, data: { type: any; notes: string }) {
  await db.collection('clients').doc(clientId).collection('interactions').add({
    ...data,
    timestamp: FieldValue.serverTimestamp(),
  })
  revalidatePath('/crm')
}

// PROPERTY ACTIONS
export async function getProperties() {
  const snapshot = await db.collection('properties').orderBy('createdAt', 'desc').get()
  const properties = snapshot.docs.map(doc => convertTimestamp(doc));

  for (const property of properties) {
      if (property.clientId) {
          const clientDoc = await db.collection('clients').doc(property.clientId).get();
          property.client = clientDoc.exists ? convertTimestamp(clientDoc) : null;
      }
      const projectsSnapshot = await db.collection('projects').where('propertyId', '==', property.id).get();
      property.projects = projectsSnapshot.docs.map(doc => convertTimestamp(doc));
  }
  return properties;
}

export async function createProperty(data: { name: string; clientId: string; address?: string; propertyType?: string; notes?: string }) {
  const newPropertyRef = db.collection('properties').doc()
  await newPropertyRef.set({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  revalidatePath('/properties')
  revalidatePath('/projects')
  const newProperty = await newPropertyRef.get();
  return convertTimestamp(newProperty);
}

export async function updateProperty(id: string, data: { name?: string; clientId?: string; address?: string; propertyType?: string; notes?: string }) {
  await db.collection('properties').doc(id).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
  })
  revalidatePath('/properties')
}

export async function deleteProperty(id: string) {
  await db.collection('properties').doc(id).delete()
  revalidatePath('/properties')
  revalidatePath('/projects')
}

// PROJECT ACTIONS
export async function getProjects() {
  const snapshot = await db.collection('projects').orderBy('createdAt', 'desc').get()
  const projects = snapshot.docs.map(doc => convertTimestamp(doc));
  
  for (const project of projects) {
      if (project.clientId) {
          const clientDoc = await db.collection('clients').doc(project.clientId).get();
          project.client = clientDoc.exists ? convertTimestamp(clientDoc) : null;
      }
      if (project.propertyId) {
          const propertyDoc = await db.collection('properties').doc(project.propertyId).get();
          project.property = propertyDoc.exists ? convertTimestamp(propertyDoc) : null;
      }
      const quotesSnapshot = await db.collection('quotes').where('projectId', '==', project.id).get();
      project.quotes = quotesSnapshot.docs.map(doc => convertTimestamp(doc));
  }
  return projects;
}

export async function createProject(data: any) {
    const newProjectRef = db.collection('projects').doc();
    await newProjectRef.set({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        status: data.status || 'Planning',
    });
    revalidatePath('/projects');
    revalidatePath('/quotes');
    const newProject = await newProjectRef.get();
    return convertTimestamp(newProject);
}

export async function updateProject(id: string, data: any) {
  await db.collection('projects').doc(id).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp()
  })
  revalidatePath('/projects')
}

export async function deleteProject(id: string) {
  await db.collection('projects').doc(id).delete()
  revalidatePath('/projects')
  revalidatePath('/quotes')
}

// QUOTE ACTIONS
export async function getQuotes() {
  const snapshot = await db.collection('quotes').orderBy('timestamp', 'desc').get()
  const quotes = snapshot.docs.map(doc => convertTimestamp(doc));

  for (const quote of quotes) {
      if (quote.clientId) {
          const clientDoc = await db.collection('clients').doc(quote.clientId).get();
          quote.client = clientDoc.exists ? convertTimestamp(clientDoc) : null;
      }
      if (quote.projectId) {
          const projectDoc = await db.collection('projects').doc(quote.projectId).get();
          quote.project = projectDoc.exists ? convertTimestamp(projectDoc) : null;
      }
  }
  return quotes;
}

export async function getQuoteById(id: string) {
  const doc = await db.collection('quotes').doc(id).get()
  if (!doc.exists) {
      return null;
  }
  const quote: any = convertTimestamp(doc);
  if (quote.clientId) {
      const clientDoc = await db.collection('clients').doc(quote.clientId).get();
      quote.client = clientDoc.exists ? convertTimestamp(clientDoc) : null;
  }
  return quote;
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
    formValues: formValues,
    allocations: allocations,
    calculations: finalCalculations,
    suggestedCalculations: suggestedCalculations,
    timestamp: FieldValue.serverTimestamp(),
  }

  if (quoteId) {
    const quoteRef = db.collection('quotes').doc(quoteId)
    await quoteRef.update({ ...data, status: 'Draft' })
    revalidatePath('/quotes')
    return { quoteId: quoteRef.id, wasExisting: true }
  }

  const newQuoteRef = db.collection('quotes').doc()
  await newQuoteRef.set({ ...data, status: 'Draft' })
  revalidatePath('/quotes')
  return { quoteId: newQuoteRef.id, wasExisting: false }
}

export async function updateQuoteStatus(id: string, status: string) {
  await db.collection('quotes').doc(id).update({ status })
  revalidatePath('/quotes')
}

export async function deleteQuote(id: string) {
  await db.collection('quotes').doc(id).delete()
  revalidatePath('/quotes')
}

export async function assignQuoteToProject(quoteId: string, projectId: string) {
  await db.collection('quotes').doc(quoteId).update({ projectId })
  revalidatePath('/quotes')
  revalidatePath('/projects')
}

// DASHBOARD METRICS
export async function getDashboardMetrics() {
    const [quotesSnapshot, projectsSnapshot, clientsSnapshot] = await Promise.all([
        db.collection('quotes').get(),
        db.collection('projects').get(),
        db.collection('clients').get()
    ]);

    const quotes = quotesSnapshot.docs.map(doc => doc.data());
    const projects = projectsSnapshot.docs.map(doc => doc.data());
    const clients = clientsSnapshot.docs.map(doc => doc.data());

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
