"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const refunds_rest_service_1 = require("../../../../src/modules/refunds/services/refunds-rest.service");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const refund_fixture_1 = require("./helpers/refund.fixture");
describe('RefundsRestService', () => {
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
    it('lists current customer order refunds inside the customer scope', async () => {
        const refundsService = {
            listCustomerOrderRefunds: jest.fn().mockResolvedValue([]),
        };
        const service = new refunds_rest_service_1.RefundsRestService(refundsService, {});
        await service.listCurrentCustomerOrderRefunds(customerUser, 'order_1');
        expect(refundsService.listCustomerOrderRefunds).toHaveBeenCalledWith('order_1', 'cust_prof_1');
    });
    it('builds a refund detail view by attaching attempts for the customer scope', async () => {
        const refundsService = {
            findCustomerRefund: jest.fn().mockResolvedValue((0, refund_fixture_1.makeRefundSummary)()),
            listRefundAttempts: jest.fn().mockResolvedValue([(0, refund_fixture_1.makeRefundAttempt)()]),
        };
        const service = new refunds_rest_service_1.RefundsRestService(refundsService, {});
        const result = await service.getCurrentCustomerOrderRefundDetail(customerUser, 'order_1', 'refund_1');
        expect(refundsService.findCustomerRefund).toHaveBeenCalledWith('cust_prof_1', 'refund_1');
        expect(refundsService.listRefundAttempts).toHaveBeenCalledWith('refund_1');
        expect(result).toMatchObject({
            refundId: 'refund_1',
            attempts: [{ refundAttemptId: 'refund_attempt_1' }],
        });
    });
    it('throws when the authenticated actor does not carry a customer profile scope', async () => {
        const service = new refunds_rest_service_1.RefundsRestService({}, {});
        expect(() => service.listCurrentCustomerOrderRefunds((0, authenticated_user_factory_1.makeAuthenticatedUser)(), 'order_1')).toThrow(app_exception_1.AppException);
    });
    it('throws when the refund does not belong to the requested order', async () => {
        const refundsService = {
            findOrderRefund: jest
                .fn()
                .mockResolvedValue((0, refund_fixture_1.makeRefundSummary)({
                order: {
                    ...(0, refund_fixture_1.makeRefundSummary)().order,
                    orderId: 'order_other',
                },
            })),
        };
        const service = new refunds_rest_service_1.RefundsRestService(refundsService, {});
        await expect(service.getCurrentAdminOrderRefundDetail('order_1', 'refund_1')).rejects.toBeInstanceOf(app_exception_1.AppException);
    });
    it('delegates admin refund request and finalization to the operations service', async () => {
        const refundOperationsService = {
            requestCurrentAdminRefund: jest.fn().mockResolvedValue((0, refund_fixture_1.makeRefundSummary)()),
            succeedCurrentAdminRefund: jest.fn().mockResolvedValue((0, refund_fixture_1.makeRefundSummary)()),
            failCurrentAdminRefund: jest.fn().mockResolvedValue((0, refund_fixture_1.makeRefundSummary)()),
        };
        const service = new refunds_rest_service_1.RefundsRestService({}, refundOperationsService);
        await service.requestCurrentAdminRefund(adminUser, 'payment_1', {
            amount: '1500',
            idempotencyKey: 'refund-idem-1',
            providerReference: 'refund_ref_1',
            reasonCode: 'customer_support',
            note: 'Goodwill refund',
        });
        await service.succeedCurrentAdminRefund(adminUser, 'refund_1', {
            providerReference: 'refund_ref_1',
            reasonCode: 'refund_succeeded',
            note: 'Provider completed the refund.',
        });
        await service.failCurrentAdminRefund(adminUser, 'refund_1', {
            providerReference: 'refund_ref_1',
            reasonCode: 'refund_failed',
            failureCode: 'provider_timeout',
            failureMessage: 'Timeout',
            note: 'Retry later.',
        });
        expect(refundOperationsService.requestCurrentAdminRefund).toHaveBeenCalledWith(adminUser, expect.objectContaining({
            paymentId: 'payment_1',
            amount: '1500',
        }));
        expect(refundOperationsService.succeedCurrentAdminRefund).toHaveBeenCalledWith(adminUser, expect.objectContaining({
            refundId: 'refund_1',
        }));
        expect(refundOperationsService.failCurrentAdminRefund).toHaveBeenCalledWith(adminUser, expect.objectContaining({
            refundId: 'refund_1',
            failureCode: 'provider_timeout',
        }));
    });
});
//# sourceMappingURL=refunds-rest.service.spec.js.map