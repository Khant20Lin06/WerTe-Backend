"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const customer_refunds_controller_1 = require("../../../../src/modules/refunds/controllers/customer-refunds.controller");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const refund_fixture_1 = require("./helpers/refund.fixture");
describe('CustomerRefundsController', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        actorContext: {
            userId: 'usr_customer_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
            customerProfileId: 'cust_prof_1',
        },
    });
    it('delegates customer refund listing to the REST service', async () => {
        const refundsRestService = {
            listCurrentCustomerOrderRefunds: jest
                .fn()
                .mockResolvedValue([(0, refund_fixture_1.makeRefundSummary)()]),
        };
        const controller = new customer_refunds_controller_1.CustomerRefundsController(refundsRestService);
        const result = await controller.list(currentUser, 'order_1');
        expect(refundsRestService.listCurrentCustomerOrderRefunds).toHaveBeenCalledWith(currentUser, 'order_1');
        expect(result[0]).toMatchObject({
            refundId: 'refund_1',
            paymentId: 'payment_1',
        });
    });
    it('delegates customer refund detail lookups to the REST service', async () => {
        const refundsRestService = {
            getCurrentCustomerOrderRefundDetail: jest
                .fn()
                .mockResolvedValue((0, refund_fixture_1.makeRefundDetail)()),
        };
        const controller = new customer_refunds_controller_1.CustomerRefundsController(refundsRestService);
        const result = await controller.detail(currentUser, 'order_1', 'refund_1');
        expect(refundsRestService.getCurrentCustomerOrderRefundDetail).toHaveBeenCalledWith(currentUser, 'order_1', 'refund_1');
        expect(result).toMatchObject({
            refundId: 'refund_1',
            attempts: [{ refundAttemptId: 'refund_attempt_1' }],
        });
    });
});
//# sourceMappingURL=customer-refunds.controller.spec.js.map