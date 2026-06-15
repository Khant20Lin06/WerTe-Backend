import { PrismaClient } from '@prisma/client';

const STORE_TYPES = [
  { code: 'restaurant', name: 'Restaurant', description: 'Food & beverages', sortOrder: 1, isSystem: true },
  { code: 'grocery', name: 'Grocery', description: 'Supermarkets & convenience stores', sortOrder: 2, isSystem: true },
  { code: 'pharmacy', name: 'Pharmacy', description: 'Medicines & health products', sortOrder: 3, isSystem: true },
  { code: 'beauty', name: 'Beauty', description: 'Cosmetics & personal care', sortOrder: 4, isSystem: true },
  { code: 'fashion', name: 'Fashion', description: 'Clothing & accessories', sortOrder: 5, isSystem: true },
];

export async function seedStoreTypes(prisma: PrismaClient) {
  for (const st of STORE_TYPES) {
    await prisma.storeType.upsert({
      where: { code: st.code },
      update: { name: st.name, description: st.description, sortOrder: st.sortOrder },
      create: { ...st, isActive: true },
    });
    console.log(`  ✓ StoreType upserted: ${st.code}`);
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedStoreTypes(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main();
