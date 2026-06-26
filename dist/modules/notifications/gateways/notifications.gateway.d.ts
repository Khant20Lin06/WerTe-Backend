import { OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationDeliveryService } from '../services/notification-delivery.service';
import { NotificationsSocketAuthService } from '../services/notifications-socket-auth.service';
export declare class NotificationsGateway implements OnGatewayInit, OnGatewayConnection {
    private readonly notificationsSocketAuthService;
    private readonly notificationDeliveryService;
    server: Server;
    constructor(notificationsSocketAuthService: NotificationsSocketAuthService, notificationDeliveryService: NotificationDeliveryService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): Promise<void>;
}
