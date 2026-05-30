import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

import { WebsocketEvents } from '../../../infrastructure/websocket/websocket-events';
import { MerchantInventoryAlertPreferenceDto } from '../dto/merchant-inventory-alert-preference.dto';
import { NotificationListPresetEntity } from '../entities/notification-list-preset.entity';
import { NotificationCenterEntity } from '../entities/notification-center.entity';
import { NotificationUnreadCountEntity } from '../entities/notification-unread-count.entity';
import { NotificationUnreadFacetsEntity } from '../entities/notification-unread-facets.entity';

export function buildNotificationUserRoom(userId: string): string {
  return `user:${userId}`;
}

@Injectable()
export class NotificationDeliveryService {
  private server: Server | null = null;

  attachServer(server: Server) {
    this.server = server;
  }

  emitNotificationCreated(notification: NotificationCenterEntity) {
    this.server
      ?.to(buildNotificationUserRoom(notification.userId))
      .emit(WebsocketEvents.notificationCreated, notification);
  }

  emitNotificationRead(notification: NotificationCenterEntity) {
    this.server
      ?.to(buildNotificationUserRoom(notification.userId))
      .emit(WebsocketEvents.notificationRead, notification);
  }

  emitNotificationBulkRead(
    userId: string,
    payload: {
      markedCount: number;
      notifications: NotificationCenterEntity[];
    },
  ) {
    this.server
      ?.to(buildNotificationUserRoom(userId))
      .emit(WebsocketEvents.notificationBulkRead, payload);
  }

  emitUnreadCountUpdated(
    userId: string,
    payload: NotificationUnreadCountEntity,
  ) {
    this.server
      ?.to(buildNotificationUserRoom(userId))
      .emit(WebsocketEvents.notificationUnreadCountUpdated, payload);
  }

  emitUnreadFacetsUpdated(
    userId: string,
    payload: NotificationUnreadFacetsEntity,
  ) {
    this.server
      ?.to(buildNotificationUserRoom(userId))
      .emit(WebsocketEvents.notificationUnreadFacetsUpdated, payload);
  }

  emitNotificationPresetsUpdated(
    userId: string,
    payload: NotificationListPresetEntity[],
  ) {
    this.server
      ?.to(buildNotificationUserRoom(userId))
      .emit(WebsocketEvents.notificationPresetsUpdated, payload);
  }

  emitNotificationPreferenceUpdated(
    userId: string,
    payload: MerchantInventoryAlertPreferenceDto,
  ) {
    this.server
      ?.to(buildNotificationUserRoom(userId))
      .emit(WebsocketEvents.notificationPreferenceUpdated, payload);
  }
}
