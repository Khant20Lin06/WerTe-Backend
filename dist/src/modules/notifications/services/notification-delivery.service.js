"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDeliveryService = void 0;
exports.buildNotificationUserRoom = buildNotificationUserRoom;
const common_1 = require("@nestjs/common");
const websocket_events_1 = require("../../../infrastructure/websocket/websocket-events");
function buildNotificationUserRoom(userId) {
    return `user:${userId}`;
}
let NotificationDeliveryService = class NotificationDeliveryService {
    constructor() {
        this.server = null;
    }
    attachServer(server) {
        this.server = server;
    }
    emitNotificationCreated(notification) {
        this.server
            ?.to(buildNotificationUserRoom(notification.userId))
            .emit(websocket_events_1.WebsocketEvents.notificationCreated, notification);
    }
    emitNotificationRead(notification) {
        this.server
            ?.to(buildNotificationUserRoom(notification.userId))
            .emit(websocket_events_1.WebsocketEvents.notificationRead, notification);
    }
    emitNotificationBulkRead(userId, payload) {
        this.server
            ?.to(buildNotificationUserRoom(userId))
            .emit(websocket_events_1.WebsocketEvents.notificationBulkRead, payload);
    }
    emitUnreadCountUpdated(userId, payload) {
        this.server
            ?.to(buildNotificationUserRoom(userId))
            .emit(websocket_events_1.WebsocketEvents.notificationUnreadCountUpdated, payload);
    }
    emitUnreadFacetsUpdated(userId, payload) {
        this.server
            ?.to(buildNotificationUserRoom(userId))
            .emit(websocket_events_1.WebsocketEvents.notificationUnreadFacetsUpdated, payload);
    }
    emitNotificationPresetsUpdated(userId, payload) {
        this.server
            ?.to(buildNotificationUserRoom(userId))
            .emit(websocket_events_1.WebsocketEvents.notificationPresetsUpdated, payload);
    }
    emitNotificationPreferenceUpdated(userId, payload) {
        this.server
            ?.to(buildNotificationUserRoom(userId))
            .emit(websocket_events_1.WebsocketEvents.notificationPreferenceUpdated, payload);
    }
};
exports.NotificationDeliveryService = NotificationDeliveryService;
exports.NotificationDeliveryService = NotificationDeliveryService = __decorate([
    (0, common_1.Injectable)()
], NotificationDeliveryService);
//# sourceMappingURL=notification-delivery.service.js.map