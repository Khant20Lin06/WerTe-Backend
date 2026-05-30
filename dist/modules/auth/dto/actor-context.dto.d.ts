import { UserRole, UserStatus } from '@prisma/client';
export declare class ActorContextDto {
    userId: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    customerProfileId?: string;
    riderId?: string;
    merchantId?: string;
}
