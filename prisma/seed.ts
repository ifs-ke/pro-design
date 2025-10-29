import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create Clients, Properties, and Projects
  const client1 = await prisma.client.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '111-111-1111',
      properties: {
        create: {
          name: 'Main Street Property',
          address: '123 Main St',
          projects: {
            create: {
              name: 'Kitchen Remodel',
              status: 'InProgress',
            },
          },
        },
      },
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Bob Williams',
      email: 'bob@example.com',
      phone: '222-222-2222',
      properties: {
        create: {
          name: 'Second Ave Condo',
          address: '456 Second Ave',
          projects: {
            create: {
              name: 'Bathroom Renovation',
              status: 'Completed',
            },
          },
        },
      },
    },
  });

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
