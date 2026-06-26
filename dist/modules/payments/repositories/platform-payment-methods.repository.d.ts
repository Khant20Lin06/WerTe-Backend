import { PaymentMethod, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
export type PlatformPaymentMethodRecord = {
    id: string;
    method: PaymentMethod;
    displayName: string;
    description: string | null;
    isEnabled: boolean;
    sortOrder: number;
    bankDetails: Prisma.JsonValue | null;
    updatedAt: Date;
    createdAt: Date;
};
export declare class PlatformPaymentMethodsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<PlatformPaymentMethodRecord[]>;
    findEnabled(): Promise<PlatformPaymentMethodRecord[]>;
    upsert(method: PaymentMethod, data: {
        displayName: string;
        description?: string | null;
        isEnabled: boolean;
        sortOrder?: number;
        bankDetails?: Prisma.InputJsonValue | null;
    }): Promise<PlatformPaymentMethodRecord>;
}
