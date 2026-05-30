import { BranchStoreTypeStatus, Prisma } from '@prisma/client';

export const customerStoreDiscoveryInclude =
  Prisma.validator<Prisma.BranchInclude>()({
    merchant: {
      select: {
        id: true,
        name: true,
        status: true,
      },
    },
    storeTypes: {
      where: {
        status: BranchStoreTypeStatus.APPROVED,
        storeType: {
          isActive: true,
          deletedAt: null,
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        storeType: {
          select: {
            id: true,
            code: true,
            name: true,
            sortOrder: true,
          },
        },
      },
    },
  });

export type CustomerStoreDiscoveryRecord = Prisma.BranchGetPayload<{
  include: typeof customerStoreDiscoveryInclude;
}>;
