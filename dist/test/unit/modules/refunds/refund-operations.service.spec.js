"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const refund_operations_service_1 = require("../../../../src/modules/refunds/services/refund-operations.service");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
function makePaymentRecord(overrides) {
    return {
        id: 'payment_1',
        orderId: 'order_1',
        customerProfileId: 'cust_prof_1',
        method: client_1.PaymentMethod.CARD,
        provider: client_1.PaymentProvider.STRIPE,
        status: client_1.PaymentStatus.SUCCEEDED,
        amount: new client_1.Prisma.Decimal('10000'),
        refundedAmount: new client_1.Prisma.Decimal('0'),
        currencyCode: 'MMK',
        idempotencyKey: 'payment-idem-1',
        providerReference: 'pi_123',
        providerReceiptId: 'receipt_123',
        failureCode: null,
        failureMessage: null,
        metadataJson: { initiatedFrom: 'checkout' },
        requiresActionAt: null,
        succeededAt: new Date('2026-04-24T08:00:00.000Z'),
        failedAt: null,
        cancelledAt: null,
        expiredAt: null,
        createdAt: new Date('2026-04-24T08:00:00.000Z'),
        updatedAt: new Date('2026-04-24T08:00:00.000Z'),
        customerProfile: {
            id: 'cust_prof_1',
            fullName: 'Mg Mg',
            avatarUrl: null,
            user: {
                id: 'usr_customer_1',
                phone: '09123456789',
                status: client_1.UserStatus.ACTIVE,
            },
        },
        order: {
            id: 'order_1',
            orderCode: 'ORD-001',
            status: client_1.OrderStatus.DELIVERED,
            totalAmount: new client_1.Prisma.Decimal('10000'),
            currencyCode: 'MMK',
            placedAt: new Date('2026-04-24T08:00:00.000Z'),
            branch: {
                id: 'branch_1',
                name: 'Downtown Branch',
                merchant: {
                    id: 'merchant_1',
                    userId: 'usr_merchant_1',
                    name: 'Demo Merchant',
                },
            },
        },
        refunds: [],
        ...overrides,
    };
}
function makeRefundRecord(overrides) {
    return {
        id: 'refund_1',
        paymentId: 'payment_1',
        orderId: 'order_1',
        createdByUserId: 'usr_admin_1',
        status: client_1.RefundStatus.PENDING,
        amount: new client_1.Prisma.Decimal('2500'),
        currencyCode: 'MMK',
        idempotencyKey: 'refund-idem-1',
        providerReference: 'refund_ref_1',
        reasonCode: 'customer_support',
        note: 'Goodwill refund',
        failureCode: null,
        failureMessage: null,
        metadataJson: { source: 'admin' },
        requestedAt: new Date('2026-04-24T09:00:00.000Z'),
        succeededAt: null,
        failedAt: null,
        cancelledAt: null,
        createdAt: new Date('2026-04-24T09:00:00.000Z'),
        updatedAt: new Date('2026-04-24T09:00:00.000Z'),
        payment: {
            id: 'payment_1',
            customerProfileId: 'cust_prof_1',
            method: client_1.PaymentMethod.CARD,
            provider: client_1.PaymentProvider.STRIPE,
            status: client_1.PaymentStatus.SUCCEEDED,
            amount: new client_1.Prisma.Decimal('10000'),
            refundedAmount: new client_1.Prisma.Decimal('0'),
            currencyCode: 'MMK',
            providerReference: 'pi_123',
            providerReceiptId: 'receipt_123',
        },
        order: {
            id: 'order_1',
            orderCode: 'ORD-001',
            status: client_1.OrderStatus.DELIVERED,
            customerProfileId: 'cust_prof_1',
            totalAmount: new client_1.Prisma.Decimal('10000'),
            currencyCode: 'MMK',
        },
        createdByUser: {
            id: 'usr_admin_1',
            role: client_1.UserRole.ADMIN,
            phone: '099999999',
            status: client_1.UserStatus.ACTIVE,
        },
        ...overrides,
    };
}
describe('RefundOperationsService', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_admin_1',
        role: client_1.UserRole.ADMIN,
        actorContext: {
            userId: 'usr_admin_1',
            phone: '099999999',
            role: client_1.UserRole.ADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const makePrismaService = () => ({
        runInTransaction: jest.fn(async (callback) => callback({})),
    });
    const makePaymentsRepository = () => ({
        findById: jest.fn(),
        updateRefundState: jest.fn(),
    });
    const makeRefundsRepository = () => ({
        findById: jest.fn(),
        findByIdempotencyKey: jest.fn(),
        createRefundRequest: jest.fn(),
        transitionRefundStatus: jest.fn(),
    });
    const makeSystemMessageService = () => ({
        publishOrderEvent: jest.fn().mockResolvedValue(undefined),
    });
    it('creates an admin refund request with guardrails and publishes a refund-requested event', async () => {
        const paymentsRepository = makePaymentsRepository();
        const refundsRepository = makeRefundsRepository();
        const systemMessageService = makeSystemMessageService();
        const service = new refund_operations_service_1.RefundOperationsService(makePrismaService(), paymentsRepository, refundsRepository, systemMessageService);
        refundsRepository.findByIdempotencyKey.mockResolvedValue(null);
        paymentsRepository.findById.mockResolvedValue(makePaymentRecord({
            refunds: [
                {
                    id: 'refund_existing',
                    status: client_1.RefundStatus.SUCCEEDED,
                    amount: new client_1.Prisma.Decimal('2000'),
                },
            ],
        }));
        refundsRepository.createRefundRequest.mockResolvedValue(makeRefundRecord({
            amount: new client_1.Prisma.Decimal('1500'),
            idempotencyKey: 'refund-idem-1',
        }));
        const result = await service.requestCurrentAdminRefund(currentUser, {
            paymentId: 'payment_1',
            amount: '1500',
            idempotencyKey: 'refund-idem-1',
            reasonCode: 'customer_support',
            note: 'Goodwill refund',
        });
        expect(refundsRepository.createRefundRequest).toHaveBeenCalledWith(expect.objectContaining({
            paymentId: 'payment_1',
            orderId: 'order_1',
            createdByUserId: 'usr_admin_1',
            amount: expect.anything(),
            status: client_1.RefundStatus.PENDING,
        }), expect.anything());
        expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(currentUser, expect.objectContaining({
            orderId: 'order_1',
            code: 'REFUND_REQUESTED',
        }));
        expect(result).toMatchObject({
            refundId: 'refund_1',
            status: client_1.RefundStatus.PENDING,
            amount: '1500',
        });
    });
    it('returns the existing refund for the same refund idempotency key', async () => {
        const service = new refund_operations_service_1.RefundOperationsService(makePrismaService(), makePaymentsRepository(), {
            findByIdempotencyKey: jest.fn().mockResolvedValue(makeRefundRecord()),
        }, makeSystemMessageService());
        const result = await service.requestCurrentAdminRefund(currentUser, {
            paymentId: 'payment_1',
            amount: '2500',
            idempotencyKey: 'refund-idem-1',
        });
        expect(result).toMatchObject({
            refundId: 'refund_1',
            idempotencyKey: 'refund-idem-1',
        });
    });
    it('rejects refund requests that exceed the available refundable balance', async () => {
        const paymentsRepository = makePaymentsRepository();
        const refundsRepository = makeRefundsRepository();
        const service = new refund_operations_service_1.RefundOperationsService(makePrismaService(), paymentsRepository, refundsRepository, makeSystemMessageService());
        refundsRepository.findByIdempotencyKey.mockResolvedValue(null);
        paymentsRepository.findById.mockResolvedValue(makePaymentRecord({
            refunds: [
                {
                    id: 'refund_existing',
                    status: client_1.RefundStatus.PROCESSING,
                    amount: new client_1.Prisma.Decimal('9000'),
                },
            ],
        }));
        await expect(service.requestCurrentAdminRefund(currentUser, {
            paymentId: 'payment_1',
            amount: '1500',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
        });
    });
    it('marks a refund successful, updates payment refund totals, and publishes a refund-succeeded event', async () => {
        const paymentsRepository = makePaymentsRepository();
        const refundsRepository = makeRefundsRepository();
        const systemMessageService = makeSystemMessageService();
        const service = new refund_operations_service_1.RefundOperationsService(makePrismaService(), paymentsRepository, refundsRepository, systemMessageService);
        refundsRepository.findById
            .mockResolvedValueOnce(makeRefundRecord())
            .mockResolvedValueOnce(makeRefundRecord({
            status: client_1.RefundStatus.SUCCEEDED,
            succeededAt: new Date('2026-04-24T09:10:00.000Z'),
            payment: {
                ...makeRefundRecord().payment,
                status: client_1.PaymentStatus.PARTIALLY_REFUNDED,
                refundedAmount: new client_1.Prisma.Decimal('2500'),
            },
        }));
        refundsRepository.transitionRefundStatus.mockResolvedValue(makeRefundRecord({
            status: client_1.RefundStatus.SUCCEEDED,
            succeededAt: new Date('2026-04-24T09:10:00.000Z'),
        }));
        paymentsRepository.findById.mockResolvedValue(makePaymentRecord({
            refundedAmount: new client_1.Prisma.Decimal('0'),
            refunds: [
                {
                    id: 'refund_1',
                    status: client_1.RefundStatus.SUCCEEDED,
                    amount: new client_1.Prisma.Decimal('2500'),
                },
            ],
        }));
        paymentsRepository.updateRefundState.mockResolvedValue(makePaymentRecord({
            refundedAmount: new client_1.Prisma.Decimal('2500'),
            status: client_1.PaymentStatus.PARTIALLY_REFUNDED,
        }));
        const result = await service.succeedCurrentAdminRefund(currentUser, {
            refundId: 'refund_1',
            providerReference: 'refund_ref_1',
        });
        expect(refundsRepository.transitionRefundStatus).toHaveBeenCalledWith(expect.objectContaining({
            refundId: 'refund_1',
            status: client_1.RefundStatus.SUCCEEDED,
        }), expect.anything());
        expect(paymentsRepository.updateRefundState).toHaveBeenCalledWith({
            paymentId: 'payment_1',
            refundedAmount: expect.anything(),
            status: client_1.PaymentStatus.PARTIALLY_REFUNDED,
        }, expect.anything());
        expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(currentUser, expect.objectContaining({
            orderId: 'order_1',
            code: 'REFUND_SUCCEEDED',
        }));
        expect(result).toMatchObject({
            refundId: 'refund_1',
            status: client_1.RefundStatus.SUCCEEDED,
            payment: {
                status: client_1.PaymentStatus.PARTIALLY_REFUNDED,
            },
        });
    });
    it('marks a refund failed without changing payment refund totals', async () => {
        const paymentsRepository = makePaymentsRepository();
        const refundsRepository = makeRefundsRepository();
        const systemMessageService = makeSystemMessageService();
        const service = new refund_operations_service_1.RefundOperationsService(makePrismaService(), paymentsRepository, refundsRepository, systemMessageService);
        refundsRepository.findById.mockResolvedValueOnce(makeRefundRecord());
        refundsRepository.transitionRefundStatus.mockResolvedValue(makeRefundRecord({
            status: client_1.RefundStatus.FAILED,
            failureCode: 'provider_timeout',
            failureMessage: 'Provider timeout',
            failedAt: new Date('2026-04-24T09:20:00.000Z'),
        }));
        refundsRepository.findById.mockResolvedValueOnce(makeRefundRecord({
            status: client_1.RefundStatus.FAILED,
            failureCode: 'provider_timeout',
            failureMessage: 'Provider timeout',
            failedAt: new Date('2026-04-24T09:20:00.000Z'),
        }));
        const result = await service.failCurrentAdminRefund(currentUser, {
            refundId: 'refund_1',
            failureCode: 'provider_timeout',
            failureMessage: 'Provider timeout',
        });
        expect(paymentsRepository.updateRefundState).not.toHaveBeenCalled();
        expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(currentUser, expect.objectContaining({
            orderId: 'order_1',
            code: 'REFUND_FAILED',
        }));
        expect(result).toMatchObject({
            refundId: 'refund_1',
            status: client_1.RefundStatus.FAILED,
            failureCode: 'provider_timeout',
        });
    });
    it('cancels a refund through trusted internal lifecycle calls without publishing a failure message', async () => {
        const paymentsRepository = makePaymentsRepository();
        const refundsRepository = makeRefundsRepository();
        const systemMessageService = makeSystemMessageService();
        const service = new refund_operations_service_1.RefundOperationsService(makePrismaService(), paymentsRepository, refundsRepository, systemMessageService);
        const systemActor = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'system:refund-provider-webhook',
            sessionId: 'system:refund-provider-webhook',
            role: client_1.UserRole.SUPPORT,
            actorContext: {
                userId: 'system:refund-provider-webhook',
                phone: 'system',
                role: client_1.UserRole.SUPPORT,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        refundsRepository.findById
            .mockResolvedValueOnce(makeRefundRecord())
            .mockResolvedValueOnce(makeRefundRecord({
            status: client_1.RefundStatus.CANCELLED,
            cancelledAt: new Date('2026-04-24T09:25:00.000Z'),
        }));
        refundsRepository.transitionRefundStatus.mockResolvedValue(makeRefundRecord({
            status: client_1.RefundStatus.CANCELLED,
            cancelledAt: new Date('2026-04-24T09:25:00.000Z'),
        }));
        const result = await service.cancelCurrentAdminRefund(systemActor, {
            refundId: 'refund_1',
            reasonCode: 'provider_refund_cancelled',
            note: 'Provider reported refund cancellation.',
        }, {
            skipAdminFinanceAccess: true,
        });
        expect(refundsRepository.transitionRefundStatus).toHaveBeenCalledWith(expect.objectContaining({
            refundId: 'refund_1',
            status: client_1.RefundStatus.CANCELLED,
            providerReference: 'refund_ref_1',
        }), expect.anything());
        expect(paymentsRepository.updateRefundState).not.toHaveBeenCalled();
        expect(systemMessageService.publishOrderEvent).not.toHaveBeenCalled();
        expect(result).toMatchObject({
            refundId: 'refund_1',
            status: client_1.RefundStatus.CANCELLED,
        });
    });
    it('rejects refund operations for non-admin actors', async () => {
        const nonAdmin = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            role: client_1.UserRole.CUSTOMER,
            actorContext: {
                userId: 'usr_customer_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_1',
            },
        });
        const service = new refund_operations_service_1.RefundOperationsService(makePrismaService(), makePaymentsRepository(), makeRefundsRepository(), makeSystemMessageService());
        await expect(service.requestCurrentAdminRefund(nonAdmin, {
            paymentId: 'payment_1',
            amount: '1000',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.FORBIDDEN,
        });
    });
});
//# sourceMappingURL=refund-operations.service.spec.js.map