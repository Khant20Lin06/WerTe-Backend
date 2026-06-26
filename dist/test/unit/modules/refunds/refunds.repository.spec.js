"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refund_attempt_entity_1 = require("../../../../src/modules/refunds/entities/refund-attempt.entity");
const refund_provider_event_entity_1 = require("../../../../src/modules/refunds/entities/refund-provider-event.entity");
const refund_summary_entity_1 = require("../../../../src/modules/refunds/entities/refund-summary.entity");
const refunds_repository_1 = require("../../../../src/modules/refunds/repositories/refunds.repository");
function makeRepository() {
    const prisma = {
        refund: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        refundAttempt: {
            findMany: jest.fn(),
        },
        refundProviderEvent: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    };
    return {
        prisma,
        repository: new refunds_repository_1.RefundsRepository(prisma),
    };
}
describe('RefundsRepository', () => {
    it('loads refund detail by id with the shared refund include', async () => {
        const { prisma, repository } = makeRepository();
        prisma.refund.findUnique.mockResolvedValue(null);
        await repository.findById('refund_1');
        expect(prisma.refund.findUnique).toHaveBeenCalledWith({
            where: {
                id: 'refund_1',
            },
            include: refund_summary_entity_1.refundSummaryInclude,
        });
    });
    it('lists customer order refunds with order ownership guard and descending request order', async () => {
        const { prisma, repository } = makeRepository();
        prisma.refund.findMany.mockResolvedValue([]);
        await repository.findCustomerOrderRefunds('order_1', 'customer_profile_1');
        expect(prisma.refund.findMany).toHaveBeenCalledWith({
            where: {
                orderId: 'order_1',
                order: {
                    is: {
                        customerProfileId: 'customer_profile_1',
                    },
                },
            },
            include: refund_summary_entity_1.refundSummaryInclude,
            orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }],
        });
    });
    it('lists payment refund attempts in chronological order', async () => {
        const { prisma, repository } = makeRepository();
        prisma.refundAttempt.findMany.mockResolvedValue([]);
        await repository.findRefundAttempts('refund_1');
        expect(prisma.refundAttempt.findMany).toHaveBeenCalledWith({
            where: {
                refundId: 'refund_1',
            },
            select: refund_attempt_entity_1.refundAttemptSelect,
            orderBy: [{ attemptedAt: 'asc' }, { id: 'asc' }],
        });
    });
    it('loads latest refund by provider reference for webhook matching', async () => {
        const { prisma, repository } = makeRepository();
        prisma.refund.findFirst.mockResolvedValue(null);
        await repository.findLatestByProviderReference('STRIPE', 're_123');
        expect(prisma.refund.findFirst).toHaveBeenCalledWith({
            where: {
                providerReference: 're_123',
                payment: {
                    is: {
                        provider: 'STRIPE',
                    },
                },
            },
            include: refund_summary_entity_1.refundSummaryInclude,
            orderBy: [{ updatedAt: 'desc' }, { requestedAt: 'desc' }, { id: 'desc' }],
        });
    });
    it('loads refunds by idempotency key using the shared refund include', async () => {
        const { prisma, repository } = makeRepository();
        prisma.refund.findUnique.mockResolvedValue(null);
        await repository.findByIdempotencyKey('refund-idem-1');
        expect(prisma.refund.findUnique).toHaveBeenCalledWith({
            where: {
                idempotencyKey: 'refund-idem-1',
            },
            include: refund_summary_entity_1.refundSummaryInclude,
        });
    });
    it('creates refund requests with a nested initial refund attempt', async () => {
        const { prisma, repository } = makeRepository();
        prisma.refund.create.mockResolvedValue({});
        await repository.createRefundRequest({
            paymentId: 'payment_1',
            orderId: 'order_1',
            createdByUserId: 'usr_admin_1',
            status: 'PENDING',
            amount: { toString: () => '1500' },
            currencyCode: 'MMK',
            idempotencyKey: 'refund-idem-1',
            providerReference: 'refund_ref_1',
            reasonCode: 'customer_support',
            note: 'Goodwill adjustment',
            metadataJson: { source: 'admin' },
            provider: 'STRIPE',
            requestPayloadJson: { amount: '1500' },
            responsePayloadJson: { nextAction: 'provider_refund_pending' },
            occurredAt: new Date('2026-04-24T09:00:00.000Z'),
        });
        expect(prisma.refund.create).toHaveBeenCalledWith({
            data: {
                paymentId: 'payment_1',
                orderId: 'order_1',
                createdByUserId: 'usr_admin_1',
                status: 'PENDING',
                amount: expect.anything(),
                currencyCode: 'MMK',
                idempotencyKey: 'refund-idem-1',
                providerReference: 'refund_ref_1',
                reasonCode: 'customer_support',
                note: 'Goodwill adjustment',
                metadataJson: { source: 'admin' },
                requestedAt: new Date('2026-04-24T09:00:00.000Z'),
                attempts: {
                    create: {
                        provider: 'STRIPE',
                        status: 'PENDING',
                        providerReference: 'refund_ref_1',
                        requestPayloadJson: { amount: '1500' },
                        responsePayloadJson: { nextAction: 'provider_refund_pending' },
                        attemptedAt: new Date('2026-04-24T09:00:00.000Z'),
                    },
                },
            },
            include: refund_summary_entity_1.refundSummaryInclude,
        });
    });
    it('transitions refund status with a nested lifecycle attempt for finalization flows', async () => {
        const { prisma, repository } = makeRepository();
        prisma.refund.update.mockResolvedValue({});
        await repository.transitionRefundStatus({
            refundId: 'refund_1',
            provider: 'STRIPE',
            status: 'SUCCEEDED',
            metadataJson: { providerWebhook: true },
            providerReference: 'refund_ref_1',
            requestPayloadJson: { refundId: 'refund_1' },
            responsePayloadJson: { outcome: 'succeeded' },
            occurredAt: new Date('2026-04-24T09:10:00.000Z'),
        });
        expect(prisma.refund.update).toHaveBeenCalledWith({
            where: {
                id: 'refund_1',
            },
            data: {
                status: 'SUCCEEDED',
                metadataJson: { providerWebhook: true },
                providerReference: 'refund_ref_1',
                failureCode: null,
                failureMessage: null,
                succeededAt: new Date('2026-04-24T09:10:00.000Z'),
                failedAt: null,
                cancelledAt: null,
                attempts: {
                    create: {
                        provider: 'STRIPE',
                        status: 'SUCCEEDED',
                        providerReference: 'refund_ref_1',
                        requestPayloadJson: { refundId: 'refund_1' },
                        responsePayloadJson: { outcome: 'succeeded' },
                        failureCode: null,
                        failureMessage: null,
                        attemptedAt: new Date('2026-04-24T09:10:00.000Z'),
                    },
                },
            },
            include: refund_summary_entity_1.refundSummaryInclude,
        });
    });
    it('loads refund provider events by provider event id for replay protection', async () => {
        const { prisma, repository } = makeRepository();
        prisma.refundProviderEvent.findUnique.mockResolvedValue(null);
        await repository.findRefundProviderEventByProviderEventId('STRIPE', 'evt_refund_1');
        expect(prisma.refundProviderEvent.findUnique).toHaveBeenCalledWith({
            where: {
                provider_providerEventId: {
                    provider: 'STRIPE',
                    providerEventId: 'evt_refund_1',
                },
            },
            select: refund_provider_event_entity_1.refundProviderEventSelect,
        });
    });
    it('loads refund provider events by internal event id for processing', async () => {
        const { prisma, repository } = makeRepository();
        prisma.refundProviderEvent.findUnique.mockResolvedValue(null);
        await repository.findRefundProviderEventById('refund_provider_event_1');
        expect(prisma.refundProviderEvent.findUnique).toHaveBeenCalledWith({
            where: {
                id: 'refund_provider_event_1',
            },
            select: refund_provider_event_entity_1.refundProviderEventSelect,
        });
    });
    it('lists processable refund provider events for reconciliation', async () => {
        const { prisma, repository } = makeRepository();
        prisma.refundProviderEvent.findMany.mockResolvedValue([]);
        await repository.listProcessableRefundProviderEvents(25);
        expect(prisma.refundProviderEvent.findMany).toHaveBeenCalledWith({
            where: {
                verificationStatus: {
                    in: ['VERIFIED', 'SKIPPED'],
                },
                processingStatus: {
                    in: ['RECEIVED', 'FAILED', 'IGNORED'],
                },
            },
            select: refund_provider_event_entity_1.refundProviderEventSelect,
            orderBy: [{ receivedAt: 'asc' }, { id: 'asc' }],
            take: 25,
        });
    });
    it('creates refund provider events with raw and normalized payload snapshots', async () => {
        const { prisma, repository } = makeRepository();
        prisma.refundProviderEvent.create.mockResolvedValue({});
        await repository.createRefundProviderEvent({
            provider: 'STRIPE',
            providerEventId: 'evt_refund_1',
            eventType: 'refund.succeeded',
            refundId: 'refund_1',
            paymentId: 'payment_1',
            orderId: 'order_1',
            providerReference: 're_123',
            normalizedStatus: 'SUCCEEDED',
            verificationStatus: 'VERIFIED',
            processingStatus: 'RECEIVED',
            signatureHeader: 'v1=signature',
            headersJson: { 'stripe-signature': 'v1=signature' },
            rawPayloadJson: { id: 'evt_refund_1' },
            normalizedPayloadJson: { refundId: 'refund_1' },
            receivedAt: new Date('2026-04-25T09:00:00.000Z'),
        });
        expect(prisma.refundProviderEvent.create).toHaveBeenCalledWith({
            data: {
                provider: 'STRIPE',
                providerEventId: 'evt_refund_1',
                eventType: 'refund.succeeded',
                refundId: 'refund_1',
                paymentId: 'payment_1',
                orderId: 'order_1',
                providerReference: 're_123',
                normalizedStatus: 'SUCCEEDED',
                verificationStatus: 'VERIFIED',
                processingStatus: 'RECEIVED',
                signatureHeader: 'v1=signature',
                headersJson: { 'stripe-signature': 'v1=signature' },
                rawPayloadJson: { id: 'evt_refund_1' },
                normalizedPayloadJson: { refundId: 'refund_1' },
                processingMetadataJson: undefined,
                failureCode: null,
                failureMessage: null,
                receivedAt: new Date('2026-04-25T09:00:00.000Z'),
                failedAt: null,
            },
            select: refund_provider_event_entity_1.refundProviderEventSelect,
        });
    });
    it('updates refund provider event processing state with lifecycle metadata', async () => {
        const { prisma, repository } = makeRepository();
        prisma.refundProviderEvent.update.mockResolvedValue({});
        await repository.updateRefundProviderEventProcessingState({
            refundProviderEventId: 'refund_provider_event_1',
            processingStatus: 'PROCESSED',
            refundId: 'refund_1',
            paymentId: 'payment_1',
            orderId: 'order_1',
            providerReference: 're_123',
            processingMetadataJson: { outcome: 'processed' },
            occurredAt: new Date('2026-04-25T10:00:00.000Z'),
        });
        expect(prisma.refundProviderEvent.update).toHaveBeenCalledWith({
            where: {
                id: 'refund_provider_event_1',
            },
            data: {
                refundId: 'refund_1',
                paymentId: 'payment_1',
                orderId: 'order_1',
                providerReference: 're_123',
                processingStatus: 'PROCESSED',
                processingMetadataJson: { outcome: 'processed' },
                failureCode: null,
                failureMessage: null,
                processedAt: new Date('2026-04-25T10:00:00.000Z'),
                failedAt: null,
                ignoredAt: null,
            },
            select: refund_provider_event_entity_1.refundProviderEventSelect,
        });
    });
});
//# sourceMappingURL=refunds.repository.spec.js.map