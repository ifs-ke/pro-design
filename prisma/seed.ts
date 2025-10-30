const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create Clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '123-456-7890',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Bob Williams',
      email: 'bob@example.com',
      phone: '098-765-4321',
    },
  });

  console.log(`Created clients ...`);

  // Create Properties
  const property1 = await prisma.property.create({
    data: {
      name: 'Main Street House',
      address: '123 Main St, Anytown, USA',
      clientId: client1.id,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      name: 'Lakeview Cottage',
      address: '456 Lakeview Dr, Lakeside, USA',
      clientId: client2.id,
    },
  });

  console.log(`Created properties ...`);


  // Create Projects
  await prisma.project.create({
    data: {
      name: 'Kitchen Renovation',
      clientId: client1.id,
      propertyId: property1.id,
      scope: 'Full kitchen remodel',
      timeline: '3 months',
      status: 'Planning',
      projectType: 'Renovation',
    },
  });

  await prisma.project.create({
    data: {
      name: 'Bathroom Update',
      clientId: client2.id,
      propertyId: property2.id,
      scope: 'Minor updates to bathroom fixtures and paint',
      timeline: '2 weeks',
      status: 'In Progress',
      projectType: 'Remodel',
    },
  });

    await prisma.project.create({
    data: {
      name: 'New Build Consultation',
      clientId: client1.id,
      scope: 'Initial consultation for a new home build',
      timeline: '1 week',
      status: 'On Hold',
      projectType: 'New Build',
    },
  });

  console.log(`Created projects ...`);


  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
