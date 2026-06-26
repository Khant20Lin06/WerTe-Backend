"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin_order_payments_controller_1 = require("../../../../src/modules/payments/controllers/admin-order-payments.controller");
const payment_fixture_1 = require("./helpers/payment.fixture");
describe('AdminOrderPaymentsController', () => {
    it('delegates admin order payment listing to the REST service', async () => {
        const paymentsRestService = {
            listCurrentAdminOrderPayments: jest
                .fn()
                .mockResolvedValue([(0, payment_fixture_1.makePaymentSummary)()]),
        };
        const controller = new admin_order_payments_controller_1.AdminOrderPaymentsController(paymentsRestService);
        const result = await controller.list('order_1');
        expect(paymentsRestService.listCurrentAdminOrderPayments).toHaveBeenCalledWith('order_1');
        expect(result[0]).toMatchObject({
            paymentId: 'payment_1',
        });
    });
    it('delegates admin order payment detail lookup to the REST service', async () => {
        const paymentsRestService = {
            getCurrentAdminOrderPaymentDetail: jest
                .fn()
                .mockResolvedValue((0, payment_fixture_1.makePaymentDetail)()),
        };
        const controller = new admin_order_payments_controller_1.AdminOrderPaymentsController(paymentsRestService);
        const result = await controller.detail('order_1', 'payment_1');
        expect(paymentsRestService.getCurrentAdminOrderPaymentDetail).toHaveBeenCalledWith('order_1', 'payment_1');
        expect(result).toMatchObject({
            paymentId: 'payment_1',
            attempts: [{ paymentAttemptId: 'payment_attempt_1' }],
        });
    });
});
//# sourceMappingURL=admin-order-payments.controller.spec.js.map