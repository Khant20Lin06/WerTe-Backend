"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const auth_repository_1 = require("../../src/modules/auth/repositories/auth.repository");
const dispatch_assignment_service_1 = require("../../src/modules/dispatch/services/dispatch-assignment.service");
const merchant_order_handling_service_1 = require("../../src/modules/orders/services/merchant-order-handling.service");
const users_service_1 = require("../../src/modules/users/services/users.service");
const create_auth_session_harness_1 = require("./helpers/create-auth-session-harness");
const critical_flow_fixtures_1 = require("./helpers/critical-flow.fixtures");
const create_integration_app_1 = require("./helpers/create-integration-app");
describe('Operations flow integration', () => {
    it('serves merchant order handling and admin dispatch assignment with role-scoped access', async () => {
        const auth = await (0, create_auth_session_harness_1.createAuthSessionHarness)([
            {
                key: 'merchant',
                userId: 'usr_merchant_1',
                role: client_1.UserRole.MERCHANT,
                phone: '0991111111',
                sessionId: 'sess_merchant_1',
                merchantId: 'merchant_1',
            },
            {
                key: 'admin',
                userId: 'usr_admin_1',
                role: client_1.UserRole.ADMIN,
                phone: '09777777777',
                sessionId: 'sess_admin_1',
            },
            {
                key: 'rider',
                userId: 'usr_rider_1',
                role: client_1.UserRole.RIDER,
                phone: '0999999999',
                sessionId: 'sess_rider_1',
                riderId: 'rider_1',
            },
        ]);
        const merchantOrderHandlingService = {
            acceptCurrentMerchantOrder: jest
                .fn()
                .mockResolvedValue((0, critical_flow_fixtures_1.createOrderDetailEntity)()),
        };
        const dispatchAssignmentService = {
            assignRiderToOrder: jest.fn().mockResolvedValue((0, critical_flow_fixtures_1.createOrderDetailEntity)()),
        };
        const harness = await (0, create_integration_app_1.createIntegrationApp)({
            overrides: [
                { provide: auth_repository_1.AuthRepository, useValue: auth.authRepository },
                { provide: users_service_1.UsersService, useValue: auth.usersService },
                {
                    provide: merchant_order_handling_service_1.MerchantOrderHandlingService,
                    useValue: merchantOrderHandlingService,
                },
                {
                    provide: dispatch_assignment_service_1.DispatchAssignmentService,
                    useValue: dispatchAssignmentService,
                },
            ],
        });
        try {
            const merchantClient = harness.client.withBearerToken(auth.actors.merchant.accessToken);
            const adminClient = harness.client.withBearerToken(auth.actors.admin.accessToken);
            const riderClient = harness.client.withBearerToken(auth.actors.rider.accessToken);
            const acceptResponse = await merchantClient.post('/api/v1/merchant/orders/order_1/accept', {
                body: {
                    note: 'Preparing now',
                },
            });
            expect(acceptResponse.status).toBe(201);
            expect(acceptResponse.body).toMatchObject({
                success: true,
                data: {
                    orderId: 'order_1',
                    status: 'MERCHANT_ACCEPTED',
                },
            });
            expect(merchantOrderHandlingService.acceptCurrentMerchantOrder).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'usr_merchant_1',
                role: client_1.UserRole.MERCHANT,
            }), expect.objectContaining({
                orderId: 'order_1',
                reasonCode: undefined,
                note: 'Preparing now',
            }));
            const assignResponse = await adminClient.post('/api/v1/admin/dispatch/orders/order_1/assign-rider', {
                body: {
                    riderId: 'rider_1',
                    etaMinutes: 15,
                    note: 'Closest rider assigned',
                },
            });
            expect(assignResponse.status).toBe(201);
            expect(assignResponse.body).toMatchObject({
                success: true,
                data: {
                    orderId: 'order_1',
                    delivery: {
                        riderId: 'rider_1',
                    },
                },
            });
            expect(dispatchAssignmentService.assignRiderToOrder).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'usr_admin_1',
                role: client_1.UserRole.ADMIN,
            }), expect.objectContaining({
                orderId: 'order_1',
                riderId: 'rider_1',
                etaMinutes: 15,
                reasonCode: undefined,
                note: 'Closest rider assigned',
            }));
            const forbiddenDispatchResponse = await riderClient.post('/api/v1/admin/dispatch/orders/order_1/assign-rider', {
                body: {
                    riderId: 'rider_1',
                },
            });
            expect(forbiddenDispatchResponse.status).toBe(403);
            expect(forbiddenDispatchResponse.body).toMatchObject({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                },
            });
        }
        finally {
            await harness.close();
        }
    });
});
//# sourceMappingURL=operations.integration.spec.js.map