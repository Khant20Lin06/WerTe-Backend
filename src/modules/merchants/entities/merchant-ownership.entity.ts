import {
  MerchantStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';

export const merchantOwnershipInclude =
  Prisma.validator<Prisma.MerchantInclude>()({
    user: {
      select: {
        id: true,
        phone: true,
        role: true,
        status: true,
      },
    },
  });

export type MerchantOwnershipRecord = Prisma.MerchantGetPayload<{
  include: typeof merchantOwnershipInclude;
}>;

export class MerchantOwnershipEntity {
  merchantId!: string;
  userId!: string;
  phone!: string;
  role!: UserRole;
  userStatus!: UserStatus;
  name!: string;
  supportPhone?: string | null;
  storeType!: string;
  status!: MerchantStatus;
}

export function buildMerchantOwnership(
  merchant: MerchantOwnershipRecord,
): MerchantOwnershipEntity {
  return {
    merchantId: merchant.id,
    userId: merchant.user.id,
    phone: merchant.user.phone,
    role: merchant.user.role,
    userStatus: merchant.user.status,
    name: merchant.name,
    supportPhone: merchant.supportPhone,
    storeType: merchant.storeType,
    status: merchant.status,
  };
}
