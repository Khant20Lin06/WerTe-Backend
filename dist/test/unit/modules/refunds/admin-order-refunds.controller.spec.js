"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin_order_refunds_controller_1 = require("../../../../src/modules/refunds/controllers/admin-order-refunds.controller");
const refund_fixture_1 = require("./helpers/refund.fixture");
describe('AdminOrderRefundsController', () => {
    it('delegates admin order refund listing to the REST service', async () => {
        const refundsRestService = {
            listCurrentAdminOrderRefunds: jest
                .fn()
                .mockResolvedValue([(0, refund_fixture_1.makeRefundSummary)()]),
        };
        const controller = new admin_order_refunds_controller_1.AdminOrderRefundsController(refundsRestService);
        const result = await controller.list('order_1');
        expect(refundsRestService.listCurrentAdminOrderRefunds).toHaveBeenCalledWith('order_1');
        expect(result[0]).toMatchObject({
            refundId: 'refund_1',
        });
    });
    it('delegates admin order refund detail lookups to the REST service', async () => {
        const refundsRestService = {
            getCurrentAdminOrderRefundDetail: jest
                .fn()
                .mockResolvedValue((0, refund_fixture_1.makeRefundDetail)()),
        };
        const controller = new admin_order_refunds_controller_1.AdminOrderRefundsController(refundsRestService);
        const result = await controller.detail('order_1', 'refund_1');
        expect(refundsRestService.getCurrentAdminOrderRefundDetail).toHaveBeenCalledWith('order_1', 'refund_1');
        expect(result).toMatchObject({
            refundId: 'refund_1',
            attempts: [{ refundAttemptId: 'refund_attempt_1' }],
        });
    });
});
//# sourceMappingURL=admin-order-refunds.controller.spec.js.map