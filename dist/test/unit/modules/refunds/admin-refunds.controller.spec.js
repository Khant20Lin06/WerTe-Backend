"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const admin_refunds_controller_1 = require("../../../../src/modules/refunds/controllers/admin-refunds.controller");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const refund_fixture_1 = require("./helpers/refund.fixture");
describe('AdminRefundsController', () => {
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
    it('delegates admin refund requests to the REST service', async () => {
        const refundsRestService = {
            requestCurrentAdminRefund: jest.fn().mockResolvedValue((0, refund_fixture_1.makeRefundSummary)()),
        };
        const controller = new admin_refunds_controller_1.AdminRefundsController(refundsRestService);
        const result = await controller.request(currentUser, 'payment_1', {
            amount: '1500',
            idempotencyKey: 'refund-idem-1',
            providerReference: 'refund_ref_1',
            reasonCode: 'customer_support',
            note: 'Goodwill refund',
        });
        expect(refundsRestService.requestCurrentAdminRefund).toHaveBeenCalledWith(currentUser, 'payment_1', {
            amount: '1500',
            idempotencyKey: 'refund-idem-1',
            providerReference: 'refund_ref_1',
            reasonCode: 'customer_support',
            note: 'Goodwill refund',
        });
        expect(result).toMatchObject({
            refundId: 'refund_1',
            paymentId: 'payment_1',
        });
    });
    it('delegates refund success and failure finalization to the REST service', async () => {
        const refundsRestService = {
            succeedCurrentAdminRefund: jest.fn().mockResolvedValue((0, refund_fixture_1.makeRefundSummary)()),
            failCurrentAdminRefund: jest.fn().mockResolvedValue((0, refund_fixture_1.makeRefundSummary)()),
        };
        const controller = new admin_refunds_controller_1.AdminRefundsController(refundsRestService);
        await controller.succeed(currentUser, 'refund_1', {
            providerReference: 'refund_ref_1',
            reasonCode: 'refund_succeeded',
            note: 'Provider completed the refund.',
        });
        await controller.fail(currentUser, 'refund_1', {
            providerReference: 'refund_ref_1',
            reasonCode: 'refund_failed',
            failureCode: 'provider_timeout',
            failureMessage: 'Timeout',
            note: 'Retry later.',
        });
        expect(refundsRestService.succeedCurrentAdminRefund).toHaveBeenCalledWith(currentUser, 'refund_1', expect.objectContaining({
            reasonCode: 'refund_succeeded',
        }));
        expect(refundsRestService.failCurrentAdminRefund).toHaveBeenCalledWith(currentUser, 'refund_1', expect.objectContaining({
            failureCode: 'provider_timeout',
        }));
    });
});
//# sourceMappingURL=admin-refunds.controller.spec.js.map