"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const notification_delivery_service_1 = require("../services/notification-delivery.service");
const notifications_socket_auth_service_1 = require("../services/notifications-socket-auth.service");
let NotificationsGateway = class NotificationsGateway {
    constructor(notificationsSocketAuthService, notificationDeliveryService) {
        this.notificationsSocketAuthService = notificationsSocketAuthService;
        this.notificationDeliveryService = notificationDeliveryService;
    }
    afterInit(server) {
        this.notificationDeliveryService.attachServer(server);
    }
    async handleConnection(client) {
        try {
            const currentUser = await this.notificationsSocketAuthService.authenticateClient(client);
            client.data.currentUser = currentUser;
            await client.join((0, notification_delivery_service_1.buildNotificationUserRoom)(currentUser.userId));
        }
        catch (_error) {
            client.disconnect(true);
        }
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
exports.NotificationsGateway = NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/notifications',
        cors: {
            origin: process.env.APP_CORS_ORIGINS
                ? process.env.APP_CORS_ORIGINS.split(',').map((o) => o.trim())
                : process.env.NODE_ENV === 'production'
                    ? false
                    : true,
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [notifications_socket_auth_service_1.NotificationsSocketAuthService,
        notification_delivery_service_1.NotificationDeliveryService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map