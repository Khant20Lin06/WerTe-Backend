import { Prisma, UserRole, UserStatus } from '@prisma/client';

export const customerProfileOwnershipInclude =
  Prisma.validator<Prisma.CustomerProfileInclude>()({
    user: {
      select: {
        id: true,
        phone: true,
        role: true,
        status: true,
      },
    },
  });

export type CustomerProfileOwnershipRecord = Prisma.CustomerProfileGetPayload<{
  include: typeof customerProfileOwnershipInclude;
}>;

export class CustomerProfileOwnershipEntity {
  customerProfileId!: string;
  userId!: string;
  phone!: string;
  role!: UserRole;
  userStatus!: UserStatus;
  fullName?: string | null;
  avatarUrl?: string | null;
}

export function buildCustomerProfileOwnership(
  profile: CustomerProfileOwnershipRecord,
): CustomerProfileOwnershipEntity {
  return {
    customerProfileId: profile.id,
    userId: profile.user.id,
    phone: profile.user.phone,
    role: profile.user.role,
    userStatus: profile.user.status,
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
  };
}
