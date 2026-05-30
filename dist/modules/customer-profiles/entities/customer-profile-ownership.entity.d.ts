import { Prisma, UserRole, UserStatus } from '@prisma/client';
export declare const customerProfileOwnershipInclude: {
    user: {
        select: {
            id: true;
            phone: true;
            role: true;
            status: true;
        };
    };
};
export type CustomerProfileOwnershipRecord = Prisma.CustomerProfileGetPayload<{
    include: typeof customerProfileOwnershipInclude;
}>;
export declare class CustomerProfileOwnershipEntity {
    customerProfileId: string;
    userId: string;
    phone: string;
    role: UserRole;
    userStatus: UserStatus;
    fullName?: string | null;
    avatarUrl?: string | null;
}
export declare function buildCustomerProfileOwnership(profile: CustomerProfileOwnershipRecord): CustomerProfileOwnershipEntity;
