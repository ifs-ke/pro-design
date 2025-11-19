
'use server';

import { z } from 'zod';
import prisma from './db';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

const clientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().optional(),
  status: z.enum(['Lead', 'Active', 'OnHold', 'Inactive']).optional(),
  responsiveness: z.enum(['Hot', 'Warm', 'Cold']).optional(),
});

const propertySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  address: z.string().min(5, 'Address must be at least 5 characters.'),
  clientId: z.string(),
});

const projectSchema = z.object({
    id: z.string().optional(), // ID is optional, for upsert logic
    name: z.string().min(2, "Name must be at least 2 characters."),
    clientId: z.string(),
    propertyId: z.string().optional(),
    scope: z.string().optional(),
    timeline: z.string().optional(),
    projectType: z.string().optional(),
    services: z.string().optional(),
    roomCount: z.number().optional(),
    otherSpaces: z.string().optional(),
});

const calculationsSchema = z.object({
  totalPrice: z.number().positive({ message: "Final quote price must be greater than 0." }),
  // Include other calculation fields as needed, or use z.any() if they are not strictly validated yet
}).passthrough();

const quoteSchema = z.object({
  id: z.string().optional(),
  clientId: z.string().min(1, { message: "Client is required." }),
  projectId: z.string().nullable(),
  formValues: z.any(),
  allocations: z.any(),
  calculations: calculationsSchema,
  suggestedCalculations: z.any(),
  status: z.string(),
  timestamp: z.string(),
});

const interactionSchema = z.object({
    id: z.string().optional(),
    clientId: z.string(),
    type: z.string(),
    notes: z.string(),
    timestamp: z.string().optional(),
});

const invoiceSchema = z.object({
  id: z.string().optional(),
  invoiceNumber: z.string().min(1, 'Invoice number is required.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled']),
  dueDate: z.coerce.date(),
  clientId: z.string(),
  projectId: z.string().optional(),
  quoteId: z.string().optional(),
});

const quoteStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['Draft', 'Sent', 'Approved', 'Declined', 'Received']),
});

export async function updateQuoteStatusAction(id: string, status: z.infer<typeof quoteStatusSchema>['status']) {
  const validatedFields = quoteStatusSchema.safeParse({ id, status });

  if (!validatedFields.success) {
    return {
      type: 'error' as const,
      message: 'Invalid data. Failed to update status.',
    };
  }

  try {
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: { status },
      include: { client: true, project: true },
    });

    revalidatePath('/quotes');
    revalidatePath(`/quotes/${id}`);

    return {
      type: 'success' as const,
      message: `Updated status to ${status}`,
      quote: updatedQuote,
    };
  } catch (e) {
    console.error(e);
    return {
      type: 'error' as const,
      message: 'Database Error: Failed to Update Quote Status.',
    };
  }
}

export async function upsertInvoice(prevState: any, formData: FormData) {
  const id = formData.get('id') as string | null;
  const validatedFields = invoiceSchema.safeParse({
    id: id || undefined,
    invoiceNumber: formData.get('invoiceNumber'),
    amount: formData.get('amount'),
    status: formData.get('status'),
    dueDate: formData.get('dueDate'),
    clientId: formData.get('clientId'),
    projectId: formData.get('projectId'),
    quoteId: formData.get('quoteId'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error' as const,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Save Invoice.',
    };
  }

  const { id: invoiceId, ...invoiceData } = validatedFields.data;

  try {
    const savedInvoice = await prisma.invoice.upsert({
      where: { id: invoiceId || '' },
      update: {
        ...invoiceData,
        updatedAt: new Date(),
      },
      create: {
        ...invoiceData,
      },
       include: {
        client: true,
        project: true,
        quote: true,
      },
    });

    revalidatePath('/invoices');
    revalidatePath('/dashboard');

    return {
      type: 'success' as const,
      message: `Saved invoice ${savedInvoice.invoiceNumber}`,
      invoice: savedInvoice,
    };
  } catch (e) {
    console.error(e);
    return {
      type: 'error' as const,
      message: 'Database Error: Failed to Save Invoice.',
    };
  }
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({ where: { id } });
    revalidatePath('/invoices');
    revalidatePath('/dashboard');
    return {
      type: 'success' as const,
      message: `Deleted invoice.`,
    };
  } catch (e) {
    console.error(e);
    return {
      type: 'error' as const,
      message: 'Database Error: Failed to Delete Invoice.',
    };
  }
}


export async function upsertProject(prevState: any, formData: FormData) {
    const roomCount = formData.get('roomCount');
    const id = formData.get('id') as string | null;

    const validatedFields = projectSchema.safeParse({
        id: id || undefined,
        name: formData.get('name'),
        clientId: formData.get('clientId'),
        propertyId: formData.get('propertyId'),
        scope: formData.get('scope'),
        timeline: formData.get('timeline'),
        projectType: formData.get('projectType'),
        services: formData.get('services'),
        roomCount: roomCount ? Number(roomCount) : undefined,
        otherSpaces: formData.get('otherSpaces'),
    });

    if (!validatedFields.success) {
        return {
            type: 'error' as const,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Save Project.',
        };
    }

    const { id: projectId, ...projectData } = validatedFields.data;

    try {
        const savedProject = await prisma.project.upsert({
            where: { id: projectId || '' },
            update: {
                ...projectData,
                updatedAt: new Date(),
            },
            create: {
                ...projectData,
                status: 'Planning',
            },
            include: { 
                client: true,
                property: true,
            },
        });

        revalidatePath('/projects');
        revalidatePath('/crm');

        return {
            type: 'success' as const,
            message: `Saved project ${savedProject.name}`,
            project: savedProject,
        };
    } catch (e) {
        console.error(e);
        return {
            type: 'error' as const,
            message: 'Database Error: Failed to Save Project.',
        };
    }
}

export async function deleteProject(id: string) {
    try {
        await prisma.$transaction(async (tx: typeof prisma) => {
            // Delete all quotes associated with this project
            await tx.quote.deleteMany({ where: { projectId: id } });
            // Delete the project itself
            await tx.project.delete({ where: { id } });
        });

        revalidatePath('/projects');
        revalidatePath('/crm');
        return {
            type: 'success' as const,
            message: `Deleted project.`,
        };
    } catch (e) {
        console.error(e);
        return {
            type: 'error' as const,
            message: 'Database Error: Failed to Delete Project.',
        };
    }
}

export async function upsertClient(prevState: any, formData: FormData) {
  const id = formData.get('id') as string | null;

  const validatedFields = clientSchema.safeParse({
    id: id || undefined,
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    status: formData.get('status'),
    responsiveness: formData.get('responsiveness'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error' as const,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Save Client.',
    };
  }

  const { id: clientId, ...clientData } = validatedFields.data;

  try {
    const savedClient = await prisma.client.upsert({
      where: { id: clientId || '' },
      update: {
        ...clientData,
        updatedAt: new Date(),
      },
      create: {
        ...clientData,
      },
    });

    revalidatePath('/crm');

    return {
      type: 'success' as const,
      message: `Saved client ${savedClient.name}`,
      client: savedClient,
    };
  } catch (e) {
    console.error(e);
    return {
      type: 'error' as const,
      message: 'Database Error: Failed to Save Client.',
    };
  }
}


export async function deleteClient(id: string) {
    try {
        await prisma.$transaction(async (tx: typeof prisma) => {
            // First, get all projects for the client
            const projects = await tx.project.findMany({ where: { clientId: id } });
            const projectIds = projects.map((p: { id: string }) => p.id);

            // Delete all quotes associated with those projects
            if (projectIds.length > 0) {
                await tx.quote.deleteMany({ where: { projectId: { in: projectIds } } });
            }
            
            // Delete all quotes associated directly with the client
            await tx.quote.deleteMany({ where: { clientId: id } });

            // Delete all projects for the client
            await tx.project.deleteMany({ where: { clientId: id } });

            // Delete all properties for the client
            await tx.property.deleteMany({ where: { clientId: id } });
            
            // Delete all interactions for the client
            await tx.interaction.deleteMany({ where: { clientId: id }});

            // Finally, delete the client
            await tx.client.delete({ where: { id } });
        });

        revalidatePath('/crm');
        revalidatePath('/projects');
        revalidatePath('/properties');
        return {
            type: 'success' as const,
            message: `Deleted client and all associated data.`,
        };
    } catch (e) {
        console.error(e);
        return {
            type: 'error' as const,
            message: 'Database Error: Failed to Delete Client.',
        };
    }
}

export async function upsertInteraction(interactionData: z.infer<typeof interactionSchema>) {
    const validatedFields = interactionSchema.safeParse(interactionData);

    if (!validatedFields.success) {
        return {
            type: 'error' as const,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Save Interaction.',
        };
    }

    const { id, ...data } = validatedFields.data;

    try {
        const savedInteraction = await prisma.interaction.upsert({
            where: { id: id || '' },
            update: { ...data, updatedAt: new Date() },
            create: { ...data },
        });

        revalidatePath('/crm');

        return {
            type: 'success' as const,
            message: `Saved interaction.`,
            interaction: savedInteraction,
        };
    } catch (e) {
        console.error(e);
        return {
            type: 'error' as const,
            message: 'Database Error: Failed to Save Interaction.',
        };
    }

}

export async function upsertProperty(prevState: any, formData: FormData) {
  const id = formData.get('id') as string | null;

  const validatedFields = propertySchema.safeParse({
    id: id || undefined,
    name: formData.get('name'),
    address: formData.get('address'),
    clientId: formData.get('clientId'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error' as const,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Save Property.',
    };
  }

  const { id: propertyId, ...propertyData } = validatedFields.data;

  try {
    const savedProperty = await prisma.property.upsert({
      where: { id: propertyId || '' },
      update: {
        ...propertyData,
        updatedAt: new Date(),
      },
      create: {
        ...propertyData,
      },
      include: {
        client: true,
      }
    });

    revalidatePath('/properties');
    revalidatePath('/crm');

    return {
      type: 'success' as const,
      message: `Saved property ${savedProperty.name}`,
      property: savedProperty,
    };
  } catch (e) {
    console.error(e);
    return {
      type: 'error' as const,
      message: 'Database Error: Failed to Save Property.',
    };
  }
}


export async function deleteProperty(id: string) {
  try {
     await prisma.$transaction(async (tx: typeof prisma) => {
        // Find all projects for the property
        const projects = await tx.project.findMany({ where: { propertyId: id } });
        const projectIds = projects.map((p: { id: string }) => p.id);

        // Delete all quotes associated with those projects
        if (projectIds.length > 0) {
            await tx.quote.deleteMany({ where: { projectId: { in: projectIds } } });
        }

        // Delete all projects for the property
        await tx.project.deleteMany({ where: { propertyId: id } });

        // Finally, delete the property
        await tx.property.delete({ where: { id } });
    });

    revalidatePath('/properties');
    revalidatePath('/projects');
    revalidatePath('/crm');
    return {
      type: 'success' as const,
      message: `Deleted property and all associated projects.`,
    };
  } catch (e) {
    console.error(e);
    return {
      type: 'error' as const,
      message: 'Database Error: Failed to Delete Property.',
    };
  }
}

export async function upsertQuote(quoteData: any) {
    const validatedFields = quoteSchema.safeParse(quoteData);

    if (!validatedFields.success) {
        const errorMessages = validatedFields.error.errors.map(e => e.message).join(', ');
        return {
            type: 'error' as const,
            errors: validatedFields.error.flatten().fieldErrors,
            message: `Missing Fields: ${errorMessages}. Failed to save Quote.`,
        };
    }

    const { id, ...data } = validatedFields.data;
    const dataForDb = { ...data, timestamp: new Date(data.timestamp) };

    try {
        let savedQuote;
        if (id) {
            // Update existing quote
            savedQuote = await prisma.quote.update({
                where: { id },
                data: dataForDb,
                include: { client: true, project: true },
            });
        } else {
            // Create new quote
            const newId = `QT-${Date.now().toString().slice(-6)}`;
            savedQuote = await prisma.quote.create({
                data: { ...(dataForDb as any), id: newId },
                include: { client: true, project: true },
            });
        }

        revalidatePath('/quotes');
        revalidatePath(`/quotes/${savedQuote.id}`);
        return {
            type: 'success' as const,
            message: `Quote ${savedQuote.id} saved.`,
            quote: savedQuote,
        };
    } catch (e) {
        console.error(e);
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
             return {
                type: 'error' as const,
                message: 'A quote with this ID already exists. Please try again.',
            };
        }
        return {
            type: 'error' as const,
            message: 'Database Error: Failed to save Quote.',
        };
    }
}

export async function deleteQuote(id: string) {
    try {
        await prisma.quote.delete({ where: { id } });
        revalidatePath('/quotes');
        return {
            type: 'success' as const,
            message: `Deleted quote.`,
        };
    } catch (e) {
        console.error(e);
        return {
            type: 'error' as const,
            message: 'Database Error: Failed to Delete Quote.',
        };
    }
}

export async function assignQuoteToProject(quoteId: string, projectId: string) {
    try {
        const updatedQuote = await prisma.quote.update({
            where: { id: quoteId },
            data: { projectId: projectId },
             include: {
                client: true,
                project: true,
            }
        });

        revalidatePath('/quotes');
        revalidatePath(`/quotes/${quoteId}`);
        revalidatePath('/projects');
        revalidatePath('/crm');
        return {
            type: 'success' as const,
            message: `Assigned quote to project.`,
            quote: updatedQuote,
        };
    } catch (e) {
        console.error(e);
        return {
            type: 'error' as const,
            message: 'Database Error: Failed to assign Quote to Project.',
        };
    }
}

export async function getProjects() {
  try {
    return await prisma.project.findMany({ include: { client: true, property: true } });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to fetch projects.');
  }
}

export async function getClients() {
  try {
    return await prisma.client.findMany({ include: { interactions: true } });
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    throw new Error('Failed to fetch clients.');
  }
}

export async function getProperties() {
  try {
    return await prisma.property.findMany({ include: { client: true } });
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    throw new Error('Failed to fetch properties.');
  }
}

export async function getQuotes() {
  try {
    return await prisma.quote.findMany({ include: { client: true, project: true } });
  } catch (error) {
    console.error('Failed to fetch quotes:', error);
    throw new Error('Failed to fetch quotes.');
  }
}

export async function getInvoices() {
  try {
    return await prisma.invoice.findMany({ include: { client: true, project: true, quote: true } });
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    throw new Error('Failed to fetch invoices.');
  }
}
