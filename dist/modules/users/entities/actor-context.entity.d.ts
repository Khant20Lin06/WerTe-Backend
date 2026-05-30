import { Prisma, UserRole, UserStatus } from '@prisma/client';
export declare const userIdentityInclude: {
    customerProfile: {
        select: {
            id: true;
        };
    };
    riderProfile: {
        select: {
            id: true;
        };
    };
    merchantProfile: {
        select: {
            id: true;
        };
    };
};
export type UserIdentityRecord = Prisma.UserGetPayload<{
    include: typeof userIdentityInclude;
}>;
export declare class ActorContextEntity {
    userId: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    customerProfileId?: string;
    riderId?: string;
    merchantId?: string;
}
export declare function buildActorContext(user: UserIdentityRecord): ActorContextEntity;
