"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const refunds_service_1 = require("../../../../src/modules/refunds/services/refunds.service");
describe('RefundsService', () => {
    let service;
    let repository;
    beforeEach(() => {
        repository = {
            findById: jest.fn(),
            findOrderRefund: jest.fn(),
            findCustomerRefund: jest.fn(),
            findOrderRefunds: jest.fn(),
            findCustomerOrderRefunds: jest.fn(),
            findPaymentRefunds: jest.fn(),
            findRefundAttempts: jest.fn(),
        };
        service = new refunds_service_1.RefundsService(repository);
    });
    it('maps order refunds into refund summary entities', async () => {
        repository.findOrderRefunds.mockResolvedValue([
            {
                id: 'refund-1',
                paymentId: 'payment-1',
                orderId: 'order-1',
                createdByUserId: 'admin-1',
                status: client_1.RefundStatus.PROCESSING,
                amount: { toString: () => '1500' },
                currencyCode: 'MMK',
                idempotencyKey: 'refund-idem-1',
                providerReference: 're_1',
                reasonCode: 'customer_support',
                note: 'Goodwill adjustment',
                failureCode: null,
                failureMessage: null,
                metadataJson: { source: 'admin' },
                requestedAt: new Date('2026-04-24T03:00:00.000Z'),
                succeededAt: null,
                failedAt: null,
                cancelledAt: null,
                createdAt: new Date('2026-04-24T03:00:00.000Z'),
                updatedAt: new Date('2026-04-24T03:01:00.000Z'),
                payment: {
                    id: 'payment-1',
                    customerProfileId: 'customer-profile-1',
                    method: client_1.PaymentMethod.DIGITAL_WALLET,
                    provider: client_1.PaymentProvider.WAVE_PAY,
                    status: client_1.PaymentStatus.PARTIALLY_REFUNDED,
                    amount: { toString: () => '12000' },
                    refundedAmount: { toString: () => '1500' },
                    currencyCode: 'MMK',
                    providerReference: 'payment-ref-1',
                    providerReceiptId: 'receipt-1',
                },
                order: {
                    id: 'order-1',
                    orderCode: 'ORD-001',
                    status: 'DELIVERED',
                    customerProfileId: 'customer-profile-1',
                    totalAmount: { toString: () => '12000' },
                    currencyCode: 'MMK',
                },
                createdByUser: {
                    id: 'admin-1',
                    role: client_1.UserRole.ADMIN,
                    phone: '+959333333333',
                    status: client_1.UserStatus.ACTIVE,
                },
            },
        ]);
        await expect(service.listOrderRefunds('order-1')).resolves.toMatchObject([
            {
                refundId: 'refund-1',
                payment: {
                    provider: client_1.PaymentProvider.WAVE_PAY,
                    status: client_1.PaymentStatus.PARTIALLY_REFUNDED,
                },
                createdByUser: {
                    role: client_1.UserRole.ADMIN,
                },
            },
        ]);
    });
    it('maps refund attempts into readable retry history entities', async () => {
        repository.findRefundAttempts.mockResolvedValue([
            {
                id: 'refund-attempt-1',
                refundId: 'refund-1',
                provider: client_1.PaymentProvider.WAVE_PAY,
                status: client_1.RefundStatus.FAILED,
                providerReference: 're_1',
                requestPayloadJson: { amount: 1500 },
                responsePayloadJson: { error: 'timeout' },
                failureCode: 'timeout',
                failureMessage: 'Provider timeout',
                attemptedAt: new Date('2026-04-24T03:02:00.000Z'),
                createdAt: new Date('2026-04-24T03:02:00.000Z'),
                updatedAt: new Date('2026-04-24T03:02:05.000Z'),
            },
        ]);
        await expect(service.listRefundAttempts('refund-1')).resolves.toMatchObject([
            {
                refundAttemptId: 'refund-attempt-1',
                provider: client_1.PaymentProvider.WAVE_PAY,
                status: client_1.RefundStatus.FAILED,
                failureCode: 'timeout',
            },
        ]);
    });
});
//# sourceMappingURL=refunds.service.spec.js.map