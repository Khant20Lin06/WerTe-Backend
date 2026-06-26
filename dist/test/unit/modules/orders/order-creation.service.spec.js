"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const order_creation_service_1 = require("../../../../src/modules/orders/services/order-creation.service");
describe('OrderCreationService', () => {
    it('delegates customer order creation to the checkout submission core', async () => {
        const currentUser = {
            userId: 'usr_1',
            sessionId: 'session_1',
            role: client_1.UserRole.CUSTOMER,
            tokenType: 'access',
            actorContext: {
                userId: 'usr_1',
                phone: '09123456789',
                role: client_1.UserRole.CUSTOMER,
                status: client_1.UserStatus.ACTIVE,
                customerProfileId: 'cust_prof_1',
            },
        };
        const dto = {
            branchId: 'branch_1',
            addressId: 'addr_1',
            idempotencyKey: 'checkout-usr_1-001',
            paymentMethod: client_1.PaymentMethod.CARD,
            paymentProvider: client_1.PaymentProvider.STRIPE,
        };
        const checkoutSubmissionService = {
            submitCurrentCustomerCheckout: jest.fn().mockResolvedValue({
                orderId: 'order_1',
                orderCode: 'ORD-00000001',
            }),
        };
        const service = new order_creation_service_1.OrderCreationService(checkoutSubmissionService);
        await expect(service.create(currentUser, dto)).resolves.toMatchObject({
            orderId: 'order_1',
            orderCode: 'ORD-00000001',
        });
        expect(checkoutSubmissionService.submitCurrentCustomerCheckout).toHaveBeenCalledWith(currentUser, {
            branchId: 'branch_1',
            addressId: 'addr_1',
            idempotencyKey: 'checkout-usr_1-001',
            paymentMethod: client_1.PaymentMethod.CARD,
            paymentProvider: client_1.PaymentProvider.STRIPE,
        });
    });
});
//# sourceMappingURL=order-creation.service.spec.js.map