"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const notifications_gateway_1 = require("../../../../src/modules/notifications/gateways/notifications.gateway");
const notification_delivery_service_1 = require("../../../../src/modules/notifications/services/notification-delivery.service");
describe('NotificationsGateway', () => {
    const currentUser = {
        userId: 'usr_merchant_1',
        sessionId: 'session_1',
        role: client_1.UserRole.MERCHANT,
        tokenType: 'access',
        actorContext: {
            userId: 'usr_merchant_1',
            phone: '09123456789',
            role: client_1.UserRole.MERCHANT,
            status: client_1.UserStatus.ACTIVE,
            merchantId: 'merchant_1',
        },
    };
    it('attaches the socket server to the notification delivery service on init', () => {
        const notificationDeliveryService = {
            attachServer: jest.fn(),
        };
        const gateway = new notifications_gateway_1.NotificationsGateway({}, notificationDeliveryService);
        const server = {};
        gateway.afterInit(server);
        expect(notificationDeliveryService.attachServer).toHaveBeenCalledWith(server);
    });
    it('authenticates the socket connection and joins the user notification room', async () => {
        const socketAuthService = {
            authenticateClient: jest.fn().mockResolvedValue(currentUser),
        };
        const gateway = new notifications_gateway_1.NotificationsGateway(socketAuthService, {});
        const client = {
            data: {},
            join: jest.fn(),
        };
        await gateway.handleConnection(client);
        expect(socketAuthService.authenticateClient).toHaveBeenCalledWith(client);
        expect(client.data.currentUser).toEqual(currentUser);
        expect(client.join).toHaveBeenCalledWith((0, notification_delivery_service_1.buildNotificationUserRoom)('usr_merchant_1'));
    });
    it('disconnects unauthorized notification sockets', async () => {
        const socketAuthService = {
            authenticateClient: jest.fn().mockRejectedValue(new Error('bad token')),
        };
        const gateway = new notifications_gateway_1.NotificationsGateway(socketAuthService, {});
        const client = {
            data: {},
            disconnect: jest.fn(),
        };
        await gateway.handleConnection(client);
        expect(client.disconnect).toHaveBeenCalledWith(true);
    });
});
//# sourceMappingURL=notifications.gateway.spec.js.map