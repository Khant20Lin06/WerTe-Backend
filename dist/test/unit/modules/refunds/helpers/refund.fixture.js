"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRefundSummary = makeRefundSummary;
exports.makeRefundAttempt = makeRefundAttempt;
exports.makeRefundDetail = makeRefundDetail;
const client_1 = require("@prisma/client");
function makeRefundSummary(overrides) {
    return {
        refundId: 'refund_1',
        paymentId: 'payment_1',
        orderId: 'order_1',
        createdByUserId: 'usr_admin_1',
        status: client_1.RefundStatus.SUCCEEDED,
        amount: '1500',
        currencyCode: 'MMK',
        idempotencyKey: 'refund-idem-1',
        providerReference: 'refund_ref_1',
        reasonCode: 'customer_support',
        note: 'Goodwill refund',
        failureCode: null,
        failureMessage: null,
        metadata: null,
        requestedAt: '2026-04-24T09:00:00.000Z',
        succeededAt: '2026-04-24T09:10:00.000Z',
        failedAt: null,
        cancelledAt: null,
        createdAt: '2026-04-24T09:00:00.000Z',
        updatedAt: '2026-04-24T09:10:00.000Z',
        payment: {
            paymentId: 'payment_1',
            customerProfileId: 'cust_prof_1',
            method: client_1.PaymentMethod.CARD,
            provider: client_1.PaymentProvider.STRIPE,
            status: client_1.PaymentStatus.PARTIALLY_REFUNDED,
            amount: '6500',
            refundedAmount: '1500',
            currencyCode: 'MMK',
            providerReference: 'pi_123',
            providerReceiptId: 'receipt_123',
        },
        order: {
            orderId: 'order_1',
            orderCode: 'ORD-001',
            status: 'DELIVERED',
            customerProfileId: 'cust_prof_1',
            totalAmount: '6500',
            currencyCode: 'MMK',
        },
        createdByUser: {
            userId: 'usr_admin_1',
            role: client_1.UserRole.ADMIN,
            phone: '099999999',
            status: client_1.UserStatus.ACTIVE,
        },
        ...overrides,
    };
}
function makeRefundAttempt(overrides) {
    return {
        refundAttemptId: 'refund_attempt_1',
        refundId: 'refund_1',
        provider: client_1.PaymentProvider.STRIPE,
        status: client_1.RefundStatus.SUCCEEDED,
        providerReference: 'refund_ref_1',
        requestPayload: null,
        responsePayload: null,
        failureCode: null,
        failureMessage: null,
        attemptedAt: '2026-04-24T09:10:00.000Z',
        createdAt: '2026-04-24T09:10:00.000Z',
        updatedAt: '2026-04-24T09:10:00.000Z',
        ...overrides,
    };
}
function makeRefundDetail(overrides) {
    return {
        ...makeRefundSummary(),
        attempts: [makeRefundAttempt()],
        ...overrides,
    };
}
//# sourceMappingURL=refund.fixture.js.map