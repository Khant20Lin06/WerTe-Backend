import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export async function seedAdmin(prisma: PrismaClient) {
  const users = [
    {
      phone: '+959000000001',
      password: 'Admin@1234',
      role: UserRole.ADMIN,
    },
    {
      phone: '+959000000002',
      password: 'Support@1234',
      role: UserRole.SUPPORT,
    },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { phone: u.phone },
      update: {},
      create: {
        phone: u.phone,
        passwordHash,
        role: u.role,
        status: UserStatus.ACTIVE,
      },
    });
    console.log(`  ✓ ${u.role} user upserted: ${u.phone}`);
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedAdmin(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main();
