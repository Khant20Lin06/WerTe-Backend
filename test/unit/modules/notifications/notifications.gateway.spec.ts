import { Server, Socket } from 'socket.io';
import { UserRole, UserStatus } from '@prisma/client';

import { NotificationsGateway } from '../../../../src/modules/notifications/gateways/notifications.gateway';
import {
  buildNotificationUserRoom,
  NotificationDeliveryService,
} from '../../../../src/modules/notifications/services/notification-delivery.service';
import { NotificationsSocketAuthService } from '../../../../src/modules/notifications/services/notifications-socket-auth.service';

describe('NotificationsGateway', () => {
  const currentUser = {
    userId: 'usr_merchant_1',
    sessionId: 'session_1',
    role: UserRole.MERCHANT,
    tokenType: 'access',
    actorContext: {
      userId: 'usr_merchant_1',
      phone: '09123456789',
      role: UserRole.MERCHANT,
      status: UserStatus.ACTIVE,
      merchantId: 'merchant_1',
    },
  } as const;

  it('attaches the socket server to the notification delivery service on init', () => {
    const notificationDeliveryService = {
      attachServer: jest.fn(),
    } as unknown as jest.Mocked<NotificationDeliveryService>;
    const gateway = new NotificationsGateway(
      {} as NotificationsSocketAuthService,
      notificationDeliveryService,
    );
    const server = {} as Server;

    gateway.afterInit(server);

    expect(notificationDeliveryService.attachServer).toHaveBeenCalledWith(server);
  });

  it('authenticates the socket connection and joins the user notification room', async () => {
    const socketAuthService = {
      authenticateClient: jest.fn().mockResolvedValue(currentUser),
    } as unknown as jest.Mocked<NotificationsSocketAuthService>;
    const gateway = new NotificationsGateway(
      socketAuthService,
      {} as NotificationDeliveryService,
    );
    const client = {
      data: {},
      join: jest.fn(),
    } as unknown as Socket;

    await gateway.handleConnection(client);

    expect(socketAuthService.authenticateClient).toHaveBeenCalledWith(client);
    expect(client.data.currentUser).toEqual(currentUser);
    expect(client.join).toHaveBeenCalledWith(
      buildNotificationUserRoom('usr_merchant_1'),
    );
  });

  it('disconnects unauthorized notification sockets', async () => {
    const socketAuthService = {
      authenticateClient: jest.fn().mockRejectedValue(new Error('bad token')),
    } as unknown as jest.Mocked<NotificationsSocketAuthService>;
    const gateway = new NotificationsGateway(
      socketAuthService,
      {} as NotificationDeliveryService,
    );
    const client = {
      data: {},
      disconnect: jest.fn(),
    } as unknown as Socket;

    await gateway.handleConnection(client);

    expect(client.disconnect).toHaveBeenCalledWith(true);
  });
});
