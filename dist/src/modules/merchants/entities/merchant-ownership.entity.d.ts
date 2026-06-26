import { MerchantStatus, Prisma, UserRole, UserStatus } from '@prisma/client';
export declare const merchantOwnershipInclude: {
    user: {
        select: {
            id: true;
            phone: true;
            role: true;
            status: true;
        };
    };
};
export type MerchantOwnershipRecord = Prisma.MerchantGetPayload<{
    include: typeof merchantOwnershipInclude;
}>;
export declare class MerchantOwnershipEntity {
    merchantId: string;
    userId: string;
    phone: string;
    role: UserRole;
    userStatus: UserStatus;
    name: string;
    supportPhone?: string | null;
    storeType: string;
    status: MerchantStatus;
}
export declare function buildMerchantOwnership(merchant: MerchantOwnershipRecord): MerchantOwnershipEntity;
