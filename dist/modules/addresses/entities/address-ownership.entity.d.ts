import { Prisma, UserRole, UserStatus } from '@prisma/client';
export declare const addressOwnershipInclude: {
    customerProfile: {
        select: {
            id: true;
            userId: true;
            user: {
                select: {
                    id: true;
                    phone: true;
                    role: true;
                    status: true;
                };
            };
        };
    };
};
export type AddressOwnershipRecord = Prisma.AddressGetPayload<{
    include: typeof addressOwnershipInclude;
}>;
export declare class AddressOwnershipEntity {
    addressId: string;
    customerProfileId: string;
    userId: string;
    phone: string;
    role: UserRole;
    userStatus: UserStatus;
    label: string;
    line1: string;
    township: string;
    city?: string | null;
    isDefault: boolean;
}
export declare function buildAddressOwnership(address: AddressOwnershipRecord): AddressOwnershipEntity;
