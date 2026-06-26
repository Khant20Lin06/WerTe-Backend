"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const payments_rest_service_1 = require("../../../../src/modules/payments/services/payments-rest.service");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const payment_fixture_1 = require("./helpers/payment.fixture");
describe('PaymentsRestService', () => {
    const customerUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        actorContext: {
            userId: 'usr_customer_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
            customerProfileId: 'cust_prof_1',
        },
    });
    const adminUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_admin_1',
        role: client_1.UserRole.ADMIN,
        actorContext: {
            userId: 'usr_admin_1',
            phone: '099999999',
            role: client_1.UserRole.ADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    it('lists current customer order payments inside the customer scope', async () => {
        const paymentsService = {
            listCustomerOrderPayments: jest.fn().mockResolvedValue([]),
        };
        const service = new payments_rest_service_1.PaymentsRestService(paymentsService, {});
        await service.listCurrentCustomerOrderPayments(customerUser, 'order_1');
        expect(paymentsService.listCustomerOrderPayments).toHaveBeenCalledWith('order_1', 'cust_prof_1');
    });
    it('builds a payment detail view by attaching attempts for the customer scope', async () => {
        const paymentsService = {
            findCustomerPayment: jest.fn().mockResolvedValue((0, payment_fixture_1.makePaymentSummary)()),
            listPaymentAttempts: jest.fn().mockResolvedValue([(0, payment_fixture_1.makePaymentAttempt)()]),
        };
        const service = new payments_rest_service_1.PaymentsRestService(paymentsService, {});
        const result = await service.getCurrentCustomerOrderPaymentDetail(customerUser, 'order_1', 'payment_1');
        expect(paymentsService.findCustomerPayment).toHaveBeenCalledWith('cust_prof_1', 'payment_1');
        expect(paymentsService.listPaymentAttempts).toHaveBeenCalledWith('payment_1');
        expect(result).toMatchObject({
            paymentId: 'payment_1',
            attempts: [{ paymentAttemptId: 'payment_attempt_1' }],
        });
    });
    it('throws when the authenticated actor does not carry a customer profile scope', async () => {
        const service = new payments_rest_service_1.PaymentsRestService({}, {});
        expect(() => service.listCurrentCustomerOrderPayments((0, authenticated_user_factory_1.makeAuthenticatedUser)(), 'order_1')).toThrow(app_exception_1.AppException);
    });
    it('throws when the payment does not belong to the requested order', async () => {
        const paymentsService = {
            findOrderPayment: jest
                .fn()
                .mockResolvedValue((0, payment_fixture_1.makePaymentSummary)({
                order: {
                    ...(0, payment_fixture_1.makePaymentSummary)().order,
                    orderId: 'order_other',
                },
            })),
        };
        const service = new payments_rest_service_1.PaymentsRestService(paymentsService, {});
        await expect(service.getCurrentAdminOrderPaymentDetail('order_1', 'payment_1')).rejects.toBeInstanceOf(app_exception_1.AppException);
    });
    it('delegates admin payment confirmation to the lifecycle service', async () => {
        const paymentLifecycleService = {
            confirmCurrentPayment: jest.fn().mockResolvedValue((0, payment_fixture_1.makePaymentSummary)()),
        };
        const service = new payments_rest_service_1.PaymentsRestService({}, paymentLifecycleService);
        await service.confirmCurrentAdminPayment(adminUser, 'payment_1', {
            providerReference: 'pi_123',
            providerReceiptId: 'receipt_123',
            reasonCode: 'payment_succeeded',
            note: 'Confirmed by admin.',
        });
        expect(paymentLifecycleService.confirmCurrentPayment).toHaveBeenCalledWith(adminUser, {
            paymentId: 'payment_1',
            providerReference: 'pi_123',
            providerReceiptId: 'receipt_123',
            reasonCode: 'payment_succeeded',
            note: 'Confirmed by admin.',
        });
    });
    it('delegates admin payment failure and cancellation to the lifecycle service', async () => {
        const paymentLifecycleService = {
            failCurrentPayment: jest.fn().mockResolvedValue((0, payment_fixture_1.makePaymentSummary)()),
            cancelCurrentPayment: jest.fn().mockResolvedValue((0, payment_fixture_1.makePaymentSummary)()),
        };
        const service = new payments_rest_service_1.PaymentsRestService({}, paymentLifecycleService);
        await service.failCurrentAdminPayment(adminUser, 'payment_1', {
            providerReference: 'pi_123',
            reasonCode: 'provider_declined',
            failureCode: 'provider_declined',
            failureMessage: 'Card declined',
            note: 'Customer should retry.',
        });
        await service.cancelCurrentAdminPayment(adminUser, 'payment_1', {
            providerReference: 'pi_123',
            reasonCode: 'payment_cancelled',
            note: 'Cancelled by support.',
        });
        expect(paymentLifecycleService.failCurrentPayment).toHaveBeenCalledWith(adminUser, expect.objectContaining({
            paymentId: 'payment_1',
            failureCode: 'provider_declined',
        }));
        expect(paymentLifecycleService.cancelCurrentPayment).toHaveBeenCalledWith(adminUser, expect.objectContaining({
            paymentId: 'payment_1',
            reasonCode: 'payment_cancelled',
        }));
    });
});
//# sourceMappingURL=payments-rest.service.spec.js.map