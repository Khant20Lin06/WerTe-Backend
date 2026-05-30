import { Prisma, UserRole, UserStatus } from '@prisma/client';

export const addressOwnershipInclude = Prisma.validator<Prisma.AddressInclude>()(
  {
    customerProfile: {
      select: {
        id: true,
        userId: true,
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
  },
);

export type AddressOwnershipRecord = Prisma.AddressGetPayload<{
  include: typeof addressOwnershipInclude;
}>;

export class AddressOwnershipEntity {
  addressId!: string;
  customerProfileId!: string;
  userId!: string;
  phone!: string;
  role!: UserRole;
  userStatus!: UserStatus;
  label!: string;
  line1!: string;
  township!: string;
  city?: string | null;
  isDefault!: boolean;
}

export function buildAddressOwnership(
  address: AddressOwnershipRecord,
): AddressOwnershipEntity {
  return {
    addressId: address.id,
    customerProfileId: address.customerProfile.id,
    userId: address.customerProfile.user.id,
    phone: address.customerProfile.user.phone,
    role: address.customerProfile.user.role,
    userStatus: address.customerProfile.user.status,
    label: address.label,
    line1: address.line1,
    township: address.township,
    city: address.city,
    isDefault: address.isDefault,
  };
}
