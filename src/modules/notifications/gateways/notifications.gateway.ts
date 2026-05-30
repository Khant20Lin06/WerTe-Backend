import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import {
  buildNotificationUserRoom,
  NotificationDeliveryService,
} from '../services/notification-delivery.service';
import { NotificationsSocketAuthService } from '../services/notifications-socket-auth.service';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly notificationsSocketAuthService: NotificationsSocketAuthService,
    private readonly notificationDeliveryService: NotificationDeliveryService,
  ) {}

  afterInit(server: Server) {
    this.notificationDeliveryService.attachServer(server);
  }

  async handleConnection(client: Socket) {
    try {
      const currentUser =
        await this.notificationsSocketAuthService.authenticateClient(client);

      client.data.currentUser = currentUser;
      await client.join(buildNotificationUserRoom(currentUser.userId));
    } catch (_error) {
      client.disconnect(true);
    }
  }
}
