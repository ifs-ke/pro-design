
'use server'

import { db } from './firebase'
import { revalidatePath } from 'next/cache'
import type { firestore as admin } from 'firebase-admin';
import type { Allocation, Calculations, FormValues } from '@/store/cost-store'

// Type helpers
type DocumentWithId<T> = T & { id: string }

const convertTimestamp = (doc: admin.DocumentSnapshot): DocumentWithId<any> => {
  const data = doc.data();
  if (!data) {
    // This case should ideally not be hit if the document exists, but it's a safeguard.
    return { id: doc.id };
  }
  
  const convertedData: { [key: string]: any } = {};
  for (const key in data) {
    const value = data[key];
    if (value && typeof value.toDate === 'function') { // Check if it's a Firestore Timestamp
      convertedData[key] = value.toDate().toISOString();
    } else {
      convertedData[key] = value;
    }
  }
  return { id: doc.id, ...convertedData };
}

// CLIENT ACTIONS
export async function getClients() {
  if (!db) throw new Error("Firestore not initialized");
  const snapshot = await db.collection('clients').orderBy('createdAt', 'desc').get()
  const clients = snapshot.docs.map(convertTimestamp);
  
  for (const client of clients) {
      const interactionsSnapshot = await db.collection('clients').doc(client.id).collection('interactions').orderBy('timestamp', 'desc').get();
      client.interactions = interactionsSnapshot.docs.map(convertTimestamp);

      const projectsSnapshot = await db.collection('projects').where('clientId', '==', client.id).get();
      client.projects = projectsSnapshot.docs.map(convertTimestamp);

      const quotesSnapshot = await db.collection('quotes').where('clientId', '==', client.id).get();
      client.quotes = quotesSnapshot.docs.map(convertTimestamp);
  }
  return clients;
}

export async function createClient(data: { name: string; email?: string; phone?: string }) {
  if (!db) throw new Error("Firestore not initialized");
  const newClientRef = db.collection('clients').doc()
  await newClientRef.set({
    ...data,
    status: 'Lead',
    responsiveness: 'Warm',
    createdAt: admin.FieldValue.serverTimestamp(),
    updatedAt: admin.FieldValue.serverTimestamp(),
  })
  revalidatePath('/crm')
  revalidatePath('/costing')
  const newClient = await newClientRef.get();
  return convertTimestamp(newClient);
}

export async function updateClient(id: string, data: { name?: string; email?: string; phone?: string; status?: string; responsiveness?: string }) {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection('clients').doc(id).update({
    ...data,
    updatedAt: admin.FieldValue.serverTimestamp(),
  })
  revalidatePath('/crm')
}

export async function deleteClient(id: string) {
  if (!db) throw new Error("Firestore not initialized");
  const batch = db.batch();

  const projectsSnapshot = await db.collection('projects').where('clientId', '==', id).get();
  projectsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  
  const quotesSnapshot = await db.collection('quotes').where('clientId', '==', id).get();
  quotesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

  const propertiesSnapshot = await db.collection('properties').where('clientId', '==', id).get();
  propertiesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

  const interactionsSnapshot = await db.collection('clients').doc(id).collection('interactions').get();
  interactionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

  batch.delete(db.collection('clients').doc(id));
  await batch.commit();

  revalidatePath('/crm')
  revalidatePath('/projects')
  revalidatePath('/quotes')
  revalidatePath('/properties')
}

export async function addInteraction(clientId: string, data: { type: any; notes: string }) {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection('clients').doc(clientId).collection('interactions').add({
    ...data,
    timestamp: admin.FieldValue.serverTimestamp(),
  })
  revalidatePath('/crm')
}

// PROPERTY ACTIONS
export async function getProperties() {
  if (!db) throw new Error("Firestore not initialized");
  const snapshot = await db.collection('properties').orderBy('createdAt', 'desc').get()
  const properties = snapshot.docs.map(convertTimestamp);

  for (const property of properties) {
      if (property.clientId) {
          const clientDoc = await db.collection('clients').doc(property.clientId).get();
          property.client = clientDoc.exists ? convertTimestamp(clientDoc) : null;
      }
      const projectsSnapshot = await db.collection('projects').where('propertyId', '==', property.id).get();
      property.projects = projectsSnapshot.docs.map(convertTimestamp);
  }
  return properties;
}

export async function createProperty(data: { name: string; clientId: string; address?: string; propertyType?: string; notes?: string }) {
  if (!db) throw new Error("Firestore not initialized");
  const newPropertyRef = db.collection('properties').doc()
  await newPropertyRef.set({
    ...data,
    createdAt: admin.FieldValue.serverTimestamp(),
    updatedAt: admin.FieldValue.serverTimestamp(),
  })
  revalidatePath('/properties')
  revalidatePath('/projects')
  const newProperty = await newPropertyRef.get();
  return convertTimestamp(newProperty);
}

export async function updateProperty(id: string, data: { name?: string; clientId?: string; address?: string; propertyType?: string; notes?: string }) {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection('properties').doc(id).update({
      ...data,
      updatedAt: admin.FieldValue.serverTimestamp(),
  })
  revalidatePath('/properties')
}

export async function deleteProperty(id: string) {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection('properties').doc(id).delete()
  revalidatePath('/properties')
  revalidatePath('/projects')
}

// PROJECT ACTIONS
export async function getProjects() {
  if (!db) throw new Error("Firestore not initialized");
  const snapshot = await db.collection('projects').orderBy('createdAt', 'desc').get()
  const projects = snapshot.docs.map(convertTimestamp);
  
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
      project.quotes = quotesSnapshot.docs.map(convertTimestamp);
  }
  return projects;
}

export async function createProject(data: any) {
    if (!db) throw new Error("Firestore not initialized");
    const newProjectRef = db.collection('projects').doc();
    await newProjectRef.set({
        ...data,
        createdAt: admin.FieldValue.serverTimestamp(),
        updatedAt: admin.FieldValue.serverTimestamp(),
        status: data.status || 'Planning',
    });
    revalidatePath('/projects');
    revalidatePath('/quotes');
    const newProject = await newProjectRef.get();
    return convertTimestamp(newProject);
}

export async function updateProject(id: string, data: any) {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection('projects').doc(id).update({
      ...data,
      updatedAt: admin.FieldValue.serverTimestamp()
  })
  revalidatePath('/projects')
}

export async function deleteProject(id: string) {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection('projects').doc(id).delete()
  revalidatePath('/projects')
  revalidatePath('/quotes')
}

// QUOTE ACTIONS
export async function getQuotes() {
  if (!db) throw new Error("Firestore not initialized");
  const snapshot = await db.collection('quotes').orderBy('timestamp', 'desc').get()
  const quotes = snapshot.docs.map(convertTimestamp);

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
  if (!db) throw new Error("Firestore not initialized");
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
  if (!db) throw new Error("Firestore not initialized");
  // Firestore cannot store undefined values, so ensure they are converted to null.
  const cleanedFormValues = JSON.parse(JSON.stringify(formValues, (key, value) =>
      typeof value === 'undefined' ? null : value
  ));

  const data = {
    clientId: cleanedFormValues.clientId,
    projectId: cleanedFormValues.projectId || null,
    formValues: cleanedFormValues,
    allocations: allocations,
    calculations: finalCalculations,
    suggestedCalculations: suggestedCalculations,
    timestamp: admin.FieldValue.serverTimestamp(),
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
  if (!db) throw new Error("Firestore not initialized");
  await db.collection('quotes').doc(id).update({ status })
  revalidatePath('/quotes')
}

export async function deleteQuote(id: string) {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection('quotes').doc(id).delete()
  revalidatePath('/quotes')
}

export async function assignQuoteToProject(quoteId: string, projectId: string) {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection('quotes').doc(quoteId).update({ projectId })
  revalidatePath('/quotes')
  revalidatePath('/projects')
}

// DASHBOARD METRICS
export async function getDashboardMetrics() {
    if (!db) throw new Error("Firestore not initialized");
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
