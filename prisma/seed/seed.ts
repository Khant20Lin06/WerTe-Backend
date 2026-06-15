import { PrismaClient } from '@prisma/client';

import { seedAdmin } from './seed-admin';
import { seedZones } from './seed-zones';
import { seedStoreTypes } from './seed-store-types';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Seeding database…');

    console.log('\n[1/3] Admin & support users');
    await seedAdmin(prisma);

    console.log('\n[2/3] Delivery zones');
    await seedZones(prisma);

    console.log('\n[3/3] System store types');
    await seedStoreTypes(prisma);

    console.log('\nSeed complete.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
