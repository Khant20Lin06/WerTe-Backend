"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const admin_payments_controller_1 = require("../../../../src/modules/payments/controllers/admin-payments.controller");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const payment_fixture_1 = require("./helpers/payment.fixture");
describe('AdminPaymentsController', () => {
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
    it('delegates admin payment confirmation to the REST service', async () => {
        const paymentsRestService = {
            confirmCurrentAdminPayment: jest
                .fn()
                .mockResolvedValue((0, payment_fixture_1.makePaymentSummary)()),
        };
        const controller = new admin_payments_controller_1.AdminPaymentsController(paymentsRestService);
        const result = await controller.confirm(currentUser, 'payment_1', {
            providerReference: 'pi_123',
            providerReceiptId: 'receipt_123',
            reasonCode: 'payment_succeeded',
            note: 'Confirmed by finance.',
        });
        expect(paymentsRestService.confirmCurrentAdminPayment).toHaveBeenCalledWith(currentUser, 'payment_1', {
            providerReference: 'pi_123',
            providerReceiptId: 'receipt_123',
            reasonCode: 'payment_succeeded',
            note: 'Confirmed by finance.',
        });
        expect(result).toMatchObject({
            paymentId: 'payment_1',
            providerReceiptId: 'receipt_123',
        });
    });
    it('delegates admin payment failure and cancellation to the REST service', async () => {
        const paymentsRestService = {
            failCurrentAdminPayment: jest.fn().mockResolvedValue((0, payment_fixture_1.makePaymentSummary)()),
            cancelCurrentAdminPayment: jest
                .fn()
                .mockResolvedValue((0, payment_fixture_1.makePaymentSummary)()),
        };
        const controller = new admin_payments_controller_1.AdminPaymentsController(paymentsRestService);
        await controller.fail(currentUser, 'payment_1', {
            providerReference: 'pi_123',
            reasonCode: 'provider_declined',
            failureCode: 'provider_declined',
            failureMessage: 'Card declined',
            note: 'Retry required.',
        });
        await controller.cancel(currentUser, 'payment_1', {
            providerReference: 'pi_123',
            reasonCode: 'payment_cancelled',
            note: 'Cancelled by support.',
        });
        expect(paymentsRestService.failCurrentAdminPayment).toHaveBeenCalledWith(currentUser, 'payment_1', expect.objectContaining({
            failureCode: 'provider_declined',
        }));
        expect(paymentsRestService.cancelCurrentAdminPayment).toHaveBeenCalledWith(currentUser, 'payment_1', expect.objectContaining({
            reasonCode: 'payment_cancelled',
        }));
    });
});
//# sourceMappingURL=admin-payments.controller.spec.js.map