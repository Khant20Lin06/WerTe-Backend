"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const auth_repository_1 = require("../../src/modules/auth/repositories/auth.repository");
const audit_read_service_1 = require("../../src/modules/audit/services/audit-read.service");
const messaging_rest_service_1 = require("../../src/modules/messaging/services/messaging-rest.service");
const notifications_rest_service_1 = require("../../src/modules/notifications/services/notifications-rest.service");
const users_service_1 = require("../../src/modules/users/services/users.service");
const create_auth_session_harness_1 = require("./helpers/create-auth-session-harness");
const critical_flow_fixtures_1 = require("./helpers/critical-flow.fixtures");
const create_integration_app_1 = require("./helpers/create-integration-app");
describe('Messaging, notifications, and audit integration', () => {
    it('serves conversation, notification, and admin audit flows through authenticated route surfaces', async () => {
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
                key: 'admin',
                userId: 'usr_admin_1',
                role: client_1.UserRole.ADMIN,
                phone: '09777777777',
                sessionId: 'sess_admin_1',
            },
        ]);
        const messagingRestService = {
            listCurrentUserOrderConversations: jest
                .fn()
                .mockResolvedValue([(0, critical_flow_fixtures_1.createConversationSummaryEntity)()]),
            sendCurrentUserMessage: jest
                .fn()
                .mockResolvedValue((0, critical_flow_fixtures_1.createSentMessageEntity)()),
        };
        const notificationsRestService = {
            listCurrentUserNotifications: jest
                .fn()
                .mockResolvedValue([(0, critical_flow_fixtures_1.createNotificationCenterEntity)()]),
            getCurrentUserUnreadCount: jest.fn().mockResolvedValue({ unreadCount: 2 }),
        };
        const auditReadService = {
            listAdminOrderAuditLogs: jest
                .fn()
                .mockResolvedValue([(0, critical_flow_fixtures_1.createAuditLogEntity)()]),
        };
        const harness = await (0, create_integration_app_1.createIntegrationApp)({
            overrides: [
                { provide: auth_repository_1.AuthRepository, useValue: auth.authRepository },
                { provide: users_service_1.UsersService, useValue: auth.usersService },
                { provide: messaging_rest_service_1.MessagingRestService, useValue: messagingRestService },
                {
                    provide: notifications_rest_service_1.NotificationsRestService,
                    useValue: notificationsRestService,
                },
                { provide: audit_read_service_1.AuditReadService, useValue: auditReadService },
            ],
        });
        try {
            const customerClient = harness.client.withBearerToken(auth.actors.customer.accessToken);
            const adminClient = harness.client.withBearerToken(auth.actors.admin.accessToken);
            const conversationsResponse = await customerClient.get('/api/v1/customer/orders/order_1/conversations?limit=5');
            expect(conversationsResponse.status).toBe(200);
            expect(conversationsResponse.body).toMatchObject({
                success: true,
                data: [
                    {
                        conversationId: 'con_1',
                        orderId: 'order_1',
                        unreadCount: 1,
                    },
                ],
            });
            expect(messagingRestService.listCurrentUserOrderConversations).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'usr_customer_1',
                role: client_1.UserRole.CUSTOMER,
            }), 'order_1', expect.objectContaining({
                limit: 5,
            }));
            const messageResponse = await customerClient.post('/api/v1/customer/conversations/con_1/messages', {
                body: {
                    type: 'text',
                    body: 'Please call me when you arrive.',
                },
            });
            expect(messageResponse.status).toBe(201);
            expect(messageResponse.body).toMatchObject({
                success: true,
                data: {
                    messageId: 'msg_2',
                    conversationId: 'con_1',
                    type: 'TEXT',
                },
            });
            expect(messagingRestService.sendCurrentUserMessage).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'usr_customer_1',
                role: client_1.UserRole.CUSTOMER,
            }), 'con_1', expect.objectContaining({
                type: 'text',
                body: 'Please call me when you arrive.',
            }));
            const notificationsResponse = await customerClient.get('/api/v1/notifications?limit=10');
            expect(notificationsResponse.status).toBe(200);
            expect(notificationsResponse.body).toMatchObject({
                success: true,
                data: [
                    {
                        notificationId: 'notification_1',
                        orderId: 'order_1',
                    },
                ],
            });
            const unreadCountResponse = await customerClient.get('/api/v1/notifications/unread-count');
            expect(unreadCountResponse.status).toBe(200);
            expect(unreadCountResponse.body).toMatchObject({
                success: true,
                data: {
                    unreadCount: 2,
                },
            });
            const auditResponse = await adminClient.get('/api/v1/admin/audit/orders/order_1?limit=20');
            expect(auditResponse.status).toBe(200);
            expect(auditResponse.body).toMatchObject({
                success: true,
                data: [
                    {
                        auditLogId: 'audit_1',
                        orderId: 'order_1',
                        action: 'orders.assign_rider',
                    },
                ],
            });
            expect(auditReadService.listAdminOrderAuditLogs).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'usr_admin_1',
                role: client_1.UserRole.ADMIN,
            }), 'order_1', expect.objectContaining({
                limit: 20,
            }));
            const forbiddenAuditResponse = await customerClient.get('/api/v1/admin/audit/orders/order_1');
            expect(forbiddenAuditResponse.status).toBe(403);
            expect(forbiddenAuditResponse.body).toMatchObject({
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
//# sourceMappingURL=messaging-notifications-audit.integration.spec.js.map