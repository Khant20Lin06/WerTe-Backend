import { PaymentMethod, PaymentProvider, PaymentStatus, Prisma, RefundStatus, UserRole, UserStatus } from '@prisma/client';
export declare const refundSummaryInclude: {
    payment: {
        select: {
            id: true;
            customerProfileId: true;
            method: true;
            provider: true;
            status: true;
            amount: true;
            refundedAmount: true;
            currencyCode: true;
            providerReference: true;
            providerReceiptId: true;
        };
    };
    order: {
        select: {
            id: true;
            orderCode: true;
            status: true;
            customerProfileId: true;
            totalAmount: true;
            currencyCode: true;
        };
    };
    createdByUser: {
        select: {
            id: true;
            role: true;
            phone: true;
            status: true;
        };
    };
};
export type RefundSummaryRecord = Prisma.RefundGetPayload<{
    include: typeof refundSummaryInclude;
}>;
export declare class RefundSummaryPaymentEntity {
    paymentId: string;
    customerProfileId: string;
    method: PaymentMethod;
    provider: PaymentProvider;
    status: PaymentStatus;
    amount: string;
    refundedAmount: string;
    currencyCode: string;
    providerReference: string | null;
    providerReceiptId: string | null;
}
export declare class RefundSummaryOrderEntity {
    orderId: string;
    orderCode: string;
    status: string;
    customerProfileId: string;
    totalAmount: string;
    currencyCode: string;
}
export declare class RefundSummaryCreatedByUserEntity {
    userId: string;
    role: UserRole;
    phone: string;
    status: UserStatus;
}
export declare class RefundSummaryEntity {
    refundId: string;
    paymentId: string;
    orderId: string;
    createdByUserId: string | null;
    status: RefundStatus;
    amount: string;
    currencyCode: string;
    idempotencyKey: string | null;
    providerReference: string | null;
    reasonCode: string | null;
    note: string | null;
    failureCode: string | null;
    failureMessage: string | null;
    metadata: Prisma.JsonValue | null;
    requestedAt: string;
    succeededAt: string | null;
    failedAt: string | null;
    cancelledAt: string | null;
    createdAt: string;
    updatedAt: string;
    payment: RefundSummaryPaymentEntity;
    order: RefundSummaryOrderEntity;
    createdByUser: RefundSummaryCreatedByUserEntity | null;
}
export declare function buildRefundSummaryEntity(refund: RefundSummaryRecord): RefundSummaryEntity;
