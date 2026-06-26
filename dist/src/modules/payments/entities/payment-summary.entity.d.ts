import { PaymentMethod, PaymentProvider, PaymentStatus, Prisma, RefundStatus, UserRole, UserStatus } from '@prisma/client';
export declare const paymentSummaryInclude: {
    order: {
        select: {
            id: true;
            orderCode: true;
            status: true;
            totalAmount: true;
            currencyCode: true;
            placedAt: true;
            branch: {
                select: {
                    id: true;
                    name: true;
                    merchant: {
                        select: {
                            id: true;
                            userId: true;
                            name: true;
                        };
                    };
                };
            };
        };
    };
    customerProfile: {
        select: {
            id: true;
            fullName: true;
            avatarUrl: true;
            user: {
                select: {
                    id: true;
                    phone: true;
                    status: true;
                };
            };
        };
    };
    refunds: {
        orderBy: [{
            requestedAt: "desc";
        }, {
            id: "desc";
        }];
        select: {
            id: true;
            status: true;
            amount: true;
            currencyCode: true;
            providerReference: true;
            reasonCode: true;
            note: true;
            requestedAt: true;
            succeededAt: true;
            failedAt: true;
            cancelledAt: true;
            createdByUser: {
                select: {
                    id: true;
                    role: true;
                    phone: true;
                };
            };
        };
    };
};
export type PaymentSummaryRecord = Prisma.PaymentGetPayload<{
    include: typeof paymentSummaryInclude;
}>;
export declare class PaymentSummaryCustomerEntity {
    customerProfileId: string;
    userId: string;
    phone: string;
    userStatus: UserStatus;
    fullName: string | null;
    avatarUrl: string | null;
}
export declare class PaymentSummaryOrderEntity {
    orderId: string;
    orderCode: string;
    status: string;
    totalAmount: string;
    currencyCode: string;
    placedAt: string;
    branchId: string;
    branchName: string;
    merchantId: string;
    merchantUserId: string;
    merchantName: string;
}
export declare class PaymentSummaryRefundEntity {
    refundId: string;
    status: RefundStatus;
    amount: string;
    currencyCode: string;
    providerReference: string | null;
    reasonCode: string | null;
    note: string | null;
    requestedAt: string;
    succeededAt: string | null;
    failedAt: string | null;
    cancelledAt: string | null;
    createdByUserId: string | null;
    createdByUserRole: UserRole | null;
    createdByUserPhone: string | null;
}
export declare class PaymentSummaryEntity {
    paymentId: string;
    orderId: string;
    customerProfileId: string;
    method: PaymentMethod;
    provider: PaymentProvider;
    status: PaymentStatus;
    amount: string;
    refundedAmount: string;
    currencyCode: string;
    idempotencyKey: string | null;
    providerReference: string | null;
    providerReceiptId: string | null;
    failureCode: string | null;
    failureMessage: string | null;
    metadata: Prisma.JsonValue | null;
    requiresActionAt: string | null;
    succeededAt: string | null;
    failedAt: string | null;
    cancelledAt: string | null;
    expiredAt: string | null;
    createdAt: string;
    updatedAt: string;
    customer: PaymentSummaryCustomerEntity;
    order: PaymentSummaryOrderEntity;
    refunds: PaymentSummaryRefundEntity[];
}
export declare function buildPaymentSummaryEntity(payment: PaymentSummaryRecord): PaymentSummaryEntity;
