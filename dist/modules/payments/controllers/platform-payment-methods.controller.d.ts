import { PaymentMethod } from '@prisma/client';
import { PlatformPaymentMethodsRepository } from '../repositories/platform-payment-methods.repository';
declare class UpsertPaymentMethodDto {
    method: PaymentMethod;
    displayName: string;
    description?: string | null;
    isEnabled: boolean;
    sortOrder?: number;
    bankDetails?: {
        accountName?: string;
        accountNumber?: string;
        bankName?: string;
        instructions?: string;
    } | null;
}
export declare class PlatformPaymentMethodsController {
    private readonly repo;
    constructor(repo: PlatformPaymentMethodsRepository);
    listEnabled(): Promise<{
        method: import(".prisma/client").$Enums.PaymentMethod;
        displayName: string;
        description: string | null;
        sortOrder: number;
        bankDetails: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    listAll(): Promise<import("../repositories/platform-payment-methods.repository").PlatformPaymentMethodRecord[]>;
    upsert(body: UpsertPaymentMethodDto): Promise<import("../repositories/platform-payment-methods.repository").PlatformPaymentMethodRecord>;
}
export {};
