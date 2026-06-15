import { PrismaClient, ZoneStatus } from '@prisma/client';

const ZONES = [
  { code: 'YGN-DOWNTOWN', name: 'Yangon Downtown', description: 'Pabedan, Kyauktada, Latha townships' },
  { code: 'YGN-NORTH', name: 'Yangon North', description: 'Insein, Hlaing Thar Yar, Shwe Pyi Thar townships' },
  { code: 'YGN-SOUTH', name: 'Yangon South', description: 'Thaketa, South Okkalapa, Thingangyun townships' },
  { code: 'YGN-EAST', name: 'Yangon East', description: 'Tamwe, Yankin, Tarmwe townships' },
  { code: 'YGN-WEST', name: 'Yangon West', description: 'Sanchaung, Kamaryut, Bahan townships' },
  { code: 'YGN-DAGON', name: 'Dagon Area', description: 'North Dagon, South Dagon, East Dagon, Dagon Seikkan townships' },
  { code: 'MDY-CENTRAL', name: 'Mandalay Central', description: 'Chanayethazan, Mahaaungmye, Chan Aye Tharzan townships' },
  { code: 'MDY-OUTER', name: 'Mandalay Outer', description: 'Patheingyi, Amarapura, Pyigyidagun townships' },
];

export async function seedZones(prisma: PrismaClient) {
  for (const zone of ZONES) {
    await prisma.zone.upsert({
      where: { code: zone.code },
      update: { name: zone.name, description: zone.description },
      create: { ...zone, status: ZoneStatus.ACTIVE },
    });
    console.log(`  ✓ Zone upserted: ${zone.code}`);
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedZones(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main();
