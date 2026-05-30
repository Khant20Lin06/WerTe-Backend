import { UserRole } from '@prisma/client';

import { AuthRepository } from '../../src/modules/auth/repositories/auth.repository';
import { AuditReadService } from '../../src/modules/audit/services/audit-read.service';
import { MessagingRestService } from '../../src/modules/messaging/services/messaging-rest.service';
import { NotificationsRestService } from '../../src/modules/notifications/services/notifications-rest.service';
import { UsersService } from '../../src/modules/users/services/users.service';
import { createAuthSessionHarness } from './helpers/create-auth-session-harness';
import {
  createAuditLogEntity,
  createConversationSummaryEntity,
  createNotificationCenterEntity,
  createSentMessageEntity,
} from './helpers/critical-flow.fixtures';
import { createIntegrationApp } from './helpers/create-integration-app';

describe('Messaging, notifications, and audit integration', () => {
  it('serves conversation, notification, and admin audit flows through authenticated route surfaces', async () => {
    const auth = await createAuthSessionHarness([
      {
        key: 'customer',
        userId: 'usr_customer_1',
        role: UserRole.CUSTOMER,
        phone: '09123456789',
        sessionId: 'sess_customer_1',
        customerProfileId: 'cust_prof_1',
      },
      {
        key: 'admin',
        userId: 'usr_admin_1',
        role: UserRole.ADMIN,
        phone: '09777777777',
        sessionId: 'sess_admin_1',
      },
    ] as const);
    const messagingRestService = {
      listCurrentUserOrderConversations: jest
        .fn()
        .mockResolvedValue([createConversationSummaryEntity()]),
      sendCurrentUserMessage: jest
        .fn()
        .mockResolvedValue(createSentMessageEntity()),
    };
    const notificationsRestService = {
      listCurrentUserNotifications: jest
        .fn()
        .mockResolvedValue([createNotificationCenterEntity()]),
      getCurrentUserUnreadCount: jest.fn().mockResolvedValue({ unreadCount: 2 }),
    };
    const auditReadService = {
      listAdminOrderAuditLogs: jest
        .fn()
        .mockResolvedValue([createAuditLogEntity()]),
    };
    const harness = await createIntegrationApp({
      overrides: [
        { provide: AuthRepository, useValue: auth.authRepository },
        { provide: UsersService, useValue: auth.usersService },
        { provide: MessagingRestService, useValue: messagingRestService },
        {
          provide: NotificationsRestService,
          useValue: notificationsRestService,
        },
        { provide: AuditReadService, useValue: auditReadService },
      ],
    });

    try {
      const customerClient = harness.client.withBearerToken(
        auth.actors.customer.accessToken,
      );
      const adminClient = harness.client.withBearerToken(
        auth.actors.admin.accessToken,
      );

      const conversationsResponse = await customerClient.get(
        '/api/v1/customer/orders/order_1/conversations?limit=5',
      );
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
      expect(
        messagingRestService.listCurrentUserOrderConversations,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr_customer_1',
          role: UserRole.CUSTOMER,
        }),
        'order_1',
        expect.objectContaining({
          limit: 5,
        }),
      );

      const messageResponse = await customerClient.post(
        '/api/v1/customer/conversations/con_1/messages',
        {
          body: {
            type: 'text',
            body: 'Please call me when you arrive.',
          },
        },
      );
      expect(messageResponse.status).toBe(201);
      expect(messageResponse.body).toMatchObject({
        success: true,
        data: {
          messageId: 'msg_2',
          conversationId: 'con_1',
          type: 'TEXT',
        },
      });
      expect(messagingRestService.sendCurrentUserMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr_customer_1',
          role: UserRole.CUSTOMER,
        }),
        'con_1',
        expect.objectContaining({
          type: 'text',
          body: 'Please call me when you arrive.',
        }),
      );

      const notificationsResponse = await customerClient.get(
        '/api/v1/notifications?limit=10',
      );
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

      const unreadCountResponse = await customerClient.get(
        '/api/v1/notifications/unread-count',
      );
      expect(unreadCountResponse.status).toBe(200);
      expect(unreadCountResponse.body).toMatchObject({
        success: true,
        data: {
          unreadCount: 2,
        },
      });

      const auditResponse = await adminClient.get(
        '/api/v1/admin/audit/orders/order_1?limit=20',
      );
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
      expect(auditReadService.listAdminOrderAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr_admin_1',
          role: UserRole.ADMIN,
        }),
        'order_1',
        expect.objectContaining({
          limit: 20,
        }),
      );

      const forbiddenAuditResponse = await customerClient.get(
        '/api/v1/admin/audit/orders/order_1',
      );
      expect(forbiddenAuditResponse.status).toBe(403);
      expect(forbiddenAuditResponse.body).toMatchObject({
        success: false,
        error: {
          code: 'FORBIDDEN',
        },
      });
    } finally {
      await harness.close();
    }
  });
});
