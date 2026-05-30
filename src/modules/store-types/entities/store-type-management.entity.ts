import { Prisma } from '@prisma/client';

export const storeTypeManagementInclude =
  Prisma.validator<Prisma.StoreTypeInclude>()({
    _count: {
      select: {
        branchAssignments: true,
        branchPrimaries: true,
        merchantPrimaries: true,
      },
    },
  });

export type StoreTypeManagementRecord = Prisma.StoreTypeGetPayload<{
  include: typeof storeTypeManagementInclude;
}>;
