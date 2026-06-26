"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const customer_payments_controller_1 = require("../../../../src/modules/payments/controllers/customer-payments.controller");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const payment_fixture_1 = require("./helpers/payment.fixture");
describe('CustomerPaymentsController', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        actorContext: {
            userId: 'usr_customer_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
            customerProfileId: 'cust_prof_1',
        },
    });
    it('delegates customer payment listing to the REST service', async () => {
        const paymentsRestService = {
            listCurrentCustomerOrderPayments: jest
                .fn()
                .mockResolvedValue([(0, payment_fixture_1.makePaymentSummary)()]),
        };
        const controller = new customer_payments_controller_1.CustomerPaymentsController(paymentsRestService);
        const result = await controller.list(currentUser, 'order_1');
        expect(paymentsRestService.listCurrentCustomerOrderPayments).toHaveBeenCalledWith(currentUser, 'order_1');
        expect(result[0]).toMatchObject({
            paymentId: 'payment_1',
            refunds: [{ refundId: 'refund_1' }],
        });
    });
    it('delegates customer payment detail lookups to the REST service', async () => {
        const paymentsRestService = {
            getCurrentCustomerOrderPaymentDetail: jest
                .fn()
                .mockResolvedValue((0, payment_fixture_1.makePaymentDetail)()),
        };
        const controller = new customer_payments_controller_1.CustomerPaymentsController(paymentsRestService);
        const result = await controller.detail(currentUser, 'order_1', 'payment_1');
        expect(paymentsRestService.getCurrentCustomerOrderPaymentDetail).toHaveBeenCalledWith(currentUser, 'order_1', 'payment_1');
        expect(result).toMatchObject({
            paymentId: 'payment_1',
            attempts: [{ paymentAttemptId: 'payment_attempt_1' }],
        });
    });
});
//# sourceMappingURL=customer-payments.controller.spec.js.map