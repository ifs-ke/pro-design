
'use server';

import { z } from 'zod';
import prisma from './db';
import { revalidatePath } from 'next/cache';

const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().optional(),
});

const propertySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  address: z.string().min(5, 'Address must be at least 5 characters.'),
  clientId: z.string(),
});

const projectSchema = z.object({
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

const quoteSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  projectId: z.string().nullable(),
  formValues: z.any(),
  allocations: z.any(),
  calculations: z.any(),
  suggestedCalculations: z.any(),
  status: z.string(),
  timestamp: z.string(),
});

export async function createClient(prevState: any, formData: FormData) {
  const validatedFields = clientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error' as const,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Client.',
    };
  }

  const { name, email, phone } = validatedFields.data;

  try {
    await prisma.client.create({
      data: {
        name,
        email,
        phone,
      },
    });

    revalidatePath('/crm');
    return {
      type: 'success' as const,
      message: `Created client ${name}`,
    };
  } catch (e) {
    console.error(e);
    return {
      type: 'error' as const,
      message: 'Database Error: Failed to Create Client.',
    };
  }
}

export async function updateClient(id: string, prevState: any, formData: FormData) {
    const validatedFields = clientSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
    });

    if (!validatedFields.success) {
        return {
            type: 'error' as const,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Client.',
        };
    }

    const { name, email, phone } = validatedFields.data;

    try {
        await prisma.client.update({
            where: { id },
            data: {
                name,
                email,
                phone,
            },
        });

        revalidatePath('/crm');
        return {
            type: 'success' as const,
            message: `Updated client ${name}`,
        };
    } catch (e) {
        console.error(e);
        return {
            type: 'error' as const,
            message: 'Database Error: Failed to Update Client.',
        };
    }
}

export async function deleteClient(id: string) {
    try {
        await prisma.client.delete({ where: { id } });
        revalidatePath('/crm');
        return {
            type: 'success' as const,
            message: `Deleted client.`,
        };
    } catch (e) {
        console.error(e);
        return {
            type: 'error' as const,
            message: 'Database Error: Failed to Delete Client.',
        };
    }
}

export async function createProperty(prevState: any, formData: FormData) {
  const validatedFields = propertySchema.safeParse({
    name: formData.get('name'),
    address: formData.get('address'),
    clientId: formData.get('clientId'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error' as const,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Property.',
    };
  }

  const { name, address, clientId } = validatedFields.data;

  try {
    await prisma.property.create({
      data: {
        name,
        address,
        clientId,
      },
    });

    revalidatePath('/properties');
    return {
      type: 'success' as const,
      message: `Created property at ${address}`,
    };
  } catch (e) {
    console.error(e);
    return {
      type: 'error' as const,
      message: 'Database Error: Failed to Create Property.',
    };
  }
}

export async function updateProperty(
  id: string,
  prevState: any,
  formData: FormData
) {
  const validatedFields = propertySchema.safeParse({
    name: formData.get('name'),
    address: formData.get('address'),
    clientId: formData.get('clientId'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error' as const,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Property.',
    };
  }

  const { name, address, clientId } = validatedFields.data;

  try {
    await prisma.property.update({
      where: {
        id,
      },
      data: {
        name,
        address,
        clientId,
      },
    });

    revalidatePath('/properties');
    return {
      type: 'success' as const,
      message: `Updated property at ${address}`,
    };
  } catch (e) {
    console.error(e);
    return {
      type: 'error' as const,
      message: 'Database Error: Failed to Update Property.',
    };
  }
}

export async function deleteProperty(id: string) {
  try {
    await prisma.property.delete({
      where: {
        id,
      },
    });

    revalidatePath('/properties');
    return {
      type: 'success' as const,
      message: `Deleted property. `,
    };
  } catch (e) {
    console.error(e);
    return {
      type: 'error' as const,
      message: 'Database Error: Failed to Delete Property.',
    };
  }
}

export async function createProject(prevState: any, formData: FormData) {
    const roomCount = formData.get('roomCount');
    const validatedFields = projectSchema.safeParse({
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
            message: 'Missing Fields. Failed to Create Project.',
        };
    }

    const { name, clientId, propertyId, scope, timeline, projectType, services, roomCount: validatedRoomCount, otherSpaces } = validatedFields.data;

    try {
        const newProject = await prisma.project.create({
            data: {
                name,
                clientId,
                propertyId,
                scope,
                timeline,
                projectType,
                services,
                roomCount: validatedRoomCount,
                otherSpaces,
                status: 'Planning',
            },
        });

        revalidatePath('/projects');
        return {
            type: 'success' as const,
            message: `Created project ${name}`,
            project: newProject,
        };
    } catch (e) {
        console.error(e);
        return {
            type: 'error' as const,
            message: 'Database Error: Failed to Create Project.',
        };
    }
}

export async function updateProject(id: string, prevState: any, formData: FormData) {
    const roomCount = formData.get('roomCount');
    const validatedFields = projectSchema.safeParse({
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
            message: 'Missing Fields. Failed to Update Project.',
        };
    }

    const { name, clientId, propertyId, scope, timeline, projectType, services, roomCount: validatedRoomCount, otherSpaces } = validatedFields.data;

    try {
        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                name,
                clientId,
                propertyId,
                scope,
                timeline,
                projectType,
                services,
                roomCount: validatedRoomCount,
                otherSpaces,
            },
        });

        revalidatePath('/projects');
        return {
            type: 'success' as const,
            message: `Updated project ${name}`,
            project: updatedProject,
        };
    } catch (e) {
        console.error(e);
        return {
            type: 'error' as const,
            message: 'Database Error: Failed to Update Project.',
        };
    }
}

export async function deleteProject(id: string) {
    try {
        await prisma.project.delete({ where: { id } });
        revalidatePath('/projects');
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


export async function upsertQuote(quoteData: any) {
  const validatedFields = quoteSchema.safeParse(quoteData);

  if (!validatedFields.success) {
    return {
      type: 'error' as const,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to save Quote.',
    };
  }

  const { id, ...data } = validatedFields.data;
  const dataForDb = { ...data, timestamp: new Date(data.timestamp) };

  try {
    await prisma.quote.upsert({
      where: { id },
      update: dataForDb,
      create: { id, ...dataForDb },
    });

    revalidatePath('/quotes');
    revalidatePath(`/quotes/${id}`);
    return {
      type: 'success' as const,
      message: `Quote ${id} saved.`,
    };
  } catch (e) {
    console.error(e);
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
        await prisma.quote.update({
            where: { id: quoteId },
            data: { projectId: projectId },
        });

        revalidatePath('/quotes');
        revalidatePath(`/quotes/${quoteId}`);
        revalidatePath('/projects');
        return {
            type: 'success' as const,
            message: `Assigned quote to project.`,
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
    return await prisma.client.findMany();
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
