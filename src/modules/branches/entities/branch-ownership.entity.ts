import {
  BranchStatus,
  MerchantStatus,
  Prisma,
  UserRole,
  UserStatus,
  ZoneStatus,
} from '@prisma/client';

export const branchOwnershipInclude = Prisma.validator<Prisma.BranchInclude>()({
  merchant: {
    select: {
      id: true,
      userId: true,
      name: true,
      storeType: true,
      status: true,
      user: {
        select: {
          id: true,
          phone: true,
          role: true,
          status: true,
        },
      },
    },
  },
  branchZones: {
    select: {
      zoneId: true,
      zone: {
        select: {
          id: true,
          code: true,
          name: true,
          status: true,
        },
      },
    },
  },
});

export type BranchOwnershipRecord = Prisma.BranchGetPayload<{
  include: typeof branchOwnershipInclude;
}>;

export class BranchZoneSummaryEntity {
  zoneId!: string;
  code!: string;
  name!: string;
  status!: ZoneStatus;
}

export class BranchOwnershipEntity {
  branchId!: string;
  merchantId!: string;
  merchantUserId!: string;
  merchantName!: string;
  merchantStoreType!: string;
  merchantStatus!: MerchantStatus;
  phone!: string;
  role!: UserRole;
  userStatus!: UserStatus;
  name!: string;
  township!: string;
  storeType!: string;
  status!: BranchStatus;
  zones!: BranchZoneSummaryEntity[];
}

export function buildBranchOwnership(
  branch: BranchOwnershipRecord,
): BranchOwnershipEntity {
  return {
    branchId: branch.id,
    merchantId: branch.merchant.id,
    merchantUserId: branch.merchant.user.id,
    merchantName: branch.merchant.name,
    merchantStoreType: branch.merchant.storeType,
    merchantStatus: branch.merchant.status,
    phone: branch.merchant.user.phone,
    role: branch.merchant.user.role,
    userStatus: branch.merchant.user.status,
    name: branch.name,
    township: branch.township,
    storeType: branch.storeType,
    status: branch.status,
    zones: branch.branchZones.map((branchZone) => ({
      zoneId: branchZone.zone.id,
      code: branchZone.zone.code,
      name: branchZone.zone.name,
      status: branchZone.zone.status,
    })),
  };
}
