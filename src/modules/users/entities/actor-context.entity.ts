import { Prisma, UserRole, UserStatus } from '@prisma/client';

export const userIdentityInclude = Prisma.validator<Prisma.UserInclude>()({
  customerProfile: {
    select: {
      id: true,
    },
  },
  riderProfile: {
    select: {
      id: true,
    },
  },
  merchantProfile: {
    select: {
      id: true,
    },
  },
});

export type UserIdentityRecord = Prisma.UserGetPayload<{
  include: typeof userIdentityInclude;
}>;

export class ActorContextEntity {
  userId!: string;
  phone!: string;
  role!: UserRole;
  status!: UserStatus;
  customerProfileId?: string;
  riderId?: string;
  merchantId?: string;
}

export function buildActorContext(
  user: UserIdentityRecord,
): ActorContextEntity {
  return {
    userId: user.id,
    phone: user.phone,
    role: user.role,
    status: user.status,
    customerProfileId: user.customerProfile?.id,
    riderId: user.riderProfile?.id,
    merchantId: user.merchantProfile?.id,
  };
}
