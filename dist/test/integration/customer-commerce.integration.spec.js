"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const auth_repository_1 = require("../../src/modules/auth/repositories/auth.repository");
const checkout_preview_service_1 = require("../../src/modules/checkout/services/checkout-preview.service");
const customer_cart_service_1 = require("../../src/modules/carts/services/customer-cart.service");
const order_creation_service_1 = require("../../src/modules/orders/services/order-creation.service");
const users_service_1 = require("../../src/modules/users/services/users.service");
const create_auth_session_harness_1 = require("./helpers/create-auth-session-harness");
const critical_flow_fixtures_1 = require("./helpers/critical-flow.fixtures");
const create_integration_app_1 = require("./helpers/create-integration-app");
describe('Customer commerce integration', () => {
    it('serves customer cart, checkout preview, and order creation through authenticated routes', async () => {
        const auth = await (0, create_auth_session_harness_1.createAuthSessionHarness)([
            {
                key: 'customer',
                userId: 'usr_customer_1',
                role: client_1.UserRole.CUSTOMER,
                phone: '09123456789',
                sessionId: 'sess_customer_1',
                customerProfileId: 'cust_prof_1',
            },
            {
                key: 'merchant',
                userId: 'usr_merchant_1',
                role: client_1.UserRole.MERCHANT,
                phone: '0991111111',
                sessionId: 'sess_merchant_1',
                merchantId: 'merchant_1',
            },
        ]);
        const customerCartService = {
            getCurrentCustomerCart: jest
                .fn()
                .mockResolvedValue((0, critical_flow_fixtures_1.createCartAggregateEntity)()),
        };
        const checkoutPreviewService = {
            previewCurrentCustomerCheckout: jest
                .fn()
                .mockResolvedValue((0, critical_flow_fixtures_1.createCheckoutPreviewEntity)()),
        };
        const orderCreationService = {
            create: jest.fn().mockResolvedValue((0, critical_flow_fixtures_1.createCheckoutSubmissionEntity)()),
        };
        const harness = await (0, create_integration_app_1.createIntegrationApp)({
            overrides: [
                { provide: auth_repository_1.AuthRepository, useValue: auth.authRepository },
                { provide: users_service_1.UsersService, useValue: auth.usersService },
                { provide: customer_cart_service_1.CustomerCartService, useValue: customerCartService },
                { provide: checkout_preview_service_1.CheckoutPreviewService, useValue: checkoutPreviewService },
                { provide: order_creation_service_1.OrderCreationService, useValue: orderCreationService },
            ],
        });
        try {
            const customerClient = harness.client.withBearerToken(auth.actors.customer.accessToken);
            const merchantClient = harness.client.withBearerToken(auth.actors.merchant.accessToken);
            const cartResponse = await customerClient.get('/api/v1/customer/cart?branchId=branch_1');
            expect(cartResponse.status).toBe(200);
            expect(cartResponse.body).toMatchObject({
                success: true,
                data: {
                    cartId: 'cart_1',
                    branchId: 'branch_1',
                    totalAmount: '6500',
                },
            });
            expect(customerCartService.getCurrentCustomerCart).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'usr_customer_1',
                role: client_1.UserRole.CUSTOMER,
            }), 'branch_1');
            const forbiddenCartResponse = await merchantClient.get('/api/v1/customer/cart?branchId=branch_1');
            expect(forbiddenCartResponse.status).toBe(403);
            expect(forbiddenCartResponse.body).toMatchObject({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                },
            });
            const previewResponse = await customerClient.post('/api/v1/customer/checkout/preview', {
                body: {
                    branchId: 'branch_1',
                    addressId: 'addr_1',
                },
            });
            expect(previewResponse.status).toBe(201);
            expect(previewResponse.body).toMatchObject({
                success: true,
                data: {
                    currencyCode: 'MMK',
                    branch: {
                        branchId: 'branch_1',
                    },
                    pricing: {
                        totalAmount: '7000',
                    },
                },
            });
            expect(checkoutPreviewService.previewCurrentCustomerCheckout).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'usr_customer_1',
                role: client_1.UserRole.CUSTOMER,
            }), expect.objectContaining({
                branchId: 'branch_1',
                addressId: 'addr_1',
            }));
            const orderResponse = await customerClient.post('/api/v1/customer/orders', {
                body: {
                    branchId: 'branch_1',
                    addressId: 'addr_1',
                    idempotencyKey: 'checkout-001',
                },
            });
            expect(orderResponse.status).toBe(201);
            expect(orderResponse.body).toMatchObject({
                success: true,
                data: {
                    orderId: 'order_1',
                    orderCode: 'ORD-00000001',
                    status: 'PLACED',
                },
            });
            expect(orderCreationService.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'usr_customer_1',
                role: client_1.UserRole.CUSTOMER,
            }), expect.objectContaining({
                branchId: 'branch_1',
                addressId: 'addr_1',
                idempotencyKey: 'checkout-001',
            }));
        }
        finally {
            await harness.close();
        }
    });
});
//# sourceMappingURL=customer-commerce.integration.spec.js.map