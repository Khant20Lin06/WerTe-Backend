"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const checkout_payment_intent_service_1 = require("../../../../src/modules/payments/services/checkout-payment-intent.service");
describe('CheckoutPaymentIntentService', () => {
    let service;
    let repository;
    beforeEach(() => {
        repository = {
            createCheckoutPaymentIntent: jest.fn(),
            findCheckoutPaymentIntentByIdempotencyKey: jest.fn(),
        };
        service = new checkout_payment_intent_service_1.CheckoutPaymentIntentService(repository);
    });
    it('creates a pending COD payment intent by default for checkout submissions', async () => {
        repository.createCheckoutPaymentIntent.mockResolvedValue({
            id: 'payment_1',
            orderId: 'order_1',
            customerProfileId: 'cust_prof_1',
            method: client_1.PaymentMethod.CASH_ON_DELIVERY,
            provider: client_1.PaymentProvider.COD,
            status: client_1.PaymentStatus.PENDING,
            amount: new client_1.Prisma.Decimal('6500'),
            currencyCode: 'MMK',
            idempotencyKey: 'idem_1',
            providerReference: null,
            providerReceiptId: null,
            failureCode: null,
            failureMessage: null,
            requiresActionAt: null,
            succeededAt: null,
            failedAt: null,
            cancelledAt: null,
            expiredAt: null,
            createdAt: new Date('2026-04-24T04:00:00.000Z'),
            updatedAt: new Date('2026-04-24T04:00:00.000Z'),
        });
        await expect(service.createCheckoutPaymentIntent({
            orderId: 'order_1',
            orderCode: 'ORD-001',
            customerProfileId: 'cust_prof_1',
            amount: new client_1.Prisma.Decimal('6500'),
            currencyCode: 'MMK',
            idempotencyKey: 'idem_1',
        })).resolves.toMatchObject({
            paymentId: 'payment_1',
            provider: client_1.PaymentProvider.COD,
            status: client_1.PaymentStatus.PENDING,
            requiresCustomerAction: false,
        });
        expect(repository.createCheckoutPaymentIntent).toHaveBeenCalledWith(expect.objectContaining({
            method: client_1.PaymentMethod.CASH_ON_DELIVERY,
            provider: client_1.PaymentProvider.COD,
            status: client_1.PaymentStatus.PENDING,
        }), undefined);
    });
    it('creates a REQUIRES_ACTION intent for external checkout methods', async () => {
        repository.createCheckoutPaymentIntent.mockResolvedValue({
            id: 'payment_2',
            orderId: 'order_1',
            customerProfileId: 'cust_prof_1',
            method: client_1.PaymentMethod.CARD,
            provider: client_1.PaymentProvider.STRIPE,
            status: client_1.PaymentStatus.REQUIRES_ACTION,
            amount: new client_1.Prisma.Decimal('6500'),
            currencyCode: 'MMK',
            idempotencyKey: 'idem_2',
            providerReference: null,
            providerReceiptId: null,
            failureCode: null,
            failureMessage: null,
            requiresActionAt: new Date('2026-04-24T04:10:00.000Z'),
            succeededAt: null,
            failedAt: null,
            cancelledAt: null,
            expiredAt: null,
            createdAt: new Date('2026-04-24T04:10:00.000Z'),
            updatedAt: new Date('2026-04-24T04:10:00.000Z'),
        });
        await expect(service.createCheckoutPaymentIntent({
            orderId: 'order_1',
            orderCode: 'ORD-001',
            customerProfileId: 'cust_prof_1',
            amount: new client_1.Prisma.Decimal('6500'),
            currencyCode: 'MMK',
            idempotencyKey: 'idem_2',
            paymentMethod: client_1.PaymentMethod.CARD,
            paymentProvider: client_1.PaymentProvider.STRIPE,
        })).resolves.toMatchObject({
            paymentId: 'payment_2',
            provider: client_1.PaymentProvider.STRIPE,
            status: client_1.PaymentStatus.REQUIRES_ACTION,
            requiresCustomerAction: true,
        });
        expect(repository.createCheckoutPaymentIntent).toHaveBeenCalledWith(expect.objectContaining({
            method: client_1.PaymentMethod.CARD,
            provider: client_1.PaymentProvider.STRIPE,
            status: client_1.PaymentStatus.REQUIRES_ACTION,
        }), undefined);
    });
    it('rejects incompatible COD provider combinations', async () => {
        await expect(service.createCheckoutPaymentIntent({
            orderId: 'order_1',
            orderCode: 'ORD-001',
            customerProfileId: 'cust_prof_1',
            amount: new client_1.Prisma.Decimal('6500'),
            currencyCode: 'MMK',
            idempotencyKey: 'idem_3',
            paymentMethod: client_1.PaymentMethod.CASH_ON_DELIVERY,
            paymentProvider: client_1.PaymentProvider.STRIPE,
        })).rejects.toMatchObject({
            status: 422,
        });
        expect(repository.createCheckoutPaymentIntent).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=checkout-payment-intent.service.spec.js.map