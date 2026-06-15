import { MerchantStatus, MerchantStaffRole, Prisma, RiderStatus, StaffStatus, UserRole, UserStatus } from '@prisma/client';

export const userIdentityInclude = Prisma.validator<Prisma.UserInclude>()({
  customerProfile: {
    select: {
      id: true,
    },
  },
  riderProfile: {
    select: {
      id: true,
      status: true,
    },
  },
  merchantProfile: {
    select: {
      id: true,
      status: true,
    },
  },
  staffProfile: {
    select: {
      id: true,
      merchantId: true,
      role: true,
      status: true,
      branchAssignments: {
        select: { branchId: true },
      },
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
  riderStatus?: RiderStatus;
  merchantId?: string;
  merchantStatus?: MerchantStatus;
  staffMemberId?: string;
  staffRole?: MerchantStaffRole;
  staffStatus?: StaffStatus;
  staffBranchIds?: string[];
  staffMerchantId?: string;
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
    riderStatus: user.riderProfile?.status,
    merchantId: user.merchantProfile?.id,
    merchantStatus: user.merchantProfile?.status,
    staffMemberId: user.staffProfile?.id,
    staffRole: user.staffProfile?.role,
    staffStatus: user.staffProfile?.status,
    staffBranchIds: user.staffProfile?.branchAssignments.map((a) => a.branchId),
    staffMerchantId: user.staffProfile?.merchantId,
  };
}
