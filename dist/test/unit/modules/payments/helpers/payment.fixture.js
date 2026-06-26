"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePaymentRelatedRefund = makePaymentRelatedRefund;
exports.makePaymentSummary = makePaymentSummary;
exports.makePaymentAttempt = makePaymentAttempt;
exports.makePaymentDetail = makePaymentDetail;
const client_1 = require("@prisma/client");
function makePaymentRelatedRefund(overrides) {
    return {
        refundId: 'refund_1',
        status: client_1.RefundStatus.SUCCEEDED,
        amount: '1500',
        currencyCode: 'MMK',
        providerReference: 'refund_ref_1',
        reasonCode: 'customer_support',
        note: 'Goodwill refund',
        requestedAt: '2026-04-24T09:00:00.000Z',
        succeededAt: '2026-04-24T09:10:00.000Z',
        failedAt: null,
        cancelledAt: null,
        createdByUserId: 'usr_admin_1',
        createdByUserRole: client_1.UserRole.ADMIN,
        createdByUserPhone: '099999999',
        ...overrides,
    };
}
function makePaymentSummary(overrides) {
    return {
        paymentId: 'payment_1',
        orderId: 'order_1',
        customerProfileId: 'cust_prof_1',
        method: client_1.PaymentMethod.CARD,
        provider: client_1.PaymentProvider.STRIPE,
        status: client_1.PaymentStatus.SUCCEEDED,
        amount: '6500',
        refundedAmount: '1500',
        currencyCode: 'MMK',
        idempotencyKey: 'payment-idem-1',
        providerReference: 'pi_123',
        providerReceiptId: 'receipt_123',
        failureCode: null,
        failureMessage: null,
        metadata: null,
        requiresActionAt: null,
        succeededAt: '2026-04-24T08:10:00.000Z',
        failedAt: null,
        cancelledAt: null,
        expiredAt: null,
        createdAt: '2026-04-24T08:00:00.000Z',
        updatedAt: '2026-04-24T08:10:00.000Z',
        customer: {
            customerProfileId: 'cust_prof_1',
            userId: 'usr_customer_1',
            phone: '09123456789',
            userStatus: client_1.UserStatus.ACTIVE,
            fullName: 'Mg Mg',
            avatarUrl: null,
        },
        order: {
            orderId: 'order_1',
            orderCode: 'ORD-001',
            status: 'PLACED',
            totalAmount: '6500',
            currencyCode: 'MMK',
            placedAt: '2026-04-24T08:00:00.000Z',
            branchId: 'branch_1',
            branchName: 'Downtown Branch',
            merchantId: 'merchant_1',
            merchantUserId: 'usr_merchant_1',
            merchantName: 'Demo Merchant',
        },
        refunds: [makePaymentRelatedRefund()],
        ...overrides,
    };
}
function makePaymentAttempt(overrides) {
    return {
        paymentAttemptId: 'payment_attempt_1',
        paymentId: 'payment_1',
        provider: client_1.PaymentProvider.STRIPE,
        status: client_1.PaymentStatus.SUCCEEDED,
        providerReference: 'pi_123',
        requestPayload: null,
        responsePayload: null,
        failureCode: null,
        failureMessage: null,
        attemptedAt: '2026-04-24T08:10:00.000Z',
        createdAt: '2026-04-24T08:10:00.000Z',
        updatedAt: '2026-04-24T08:10:00.000Z',
        ...overrides,
    };
}
function makePaymentDetail(overrides) {
    return {
        ...makePaymentSummary(),
        attempts: [makePaymentAttempt()],
        ...overrides,
    };
}
//# sourceMappingURL=payment.fixture.js.map