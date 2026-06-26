"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websockets_1 = require("@nestjs/websockets");
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const messaging_gateway_1 = require("../../../../src/modules/messaging/gateways/messaging.gateway");
describe('MessagingGateway', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_customer_1',
        role: client_1.UserRole.CUSTOMER,
        actorContext: {
            userId: 'usr_customer_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
            customerProfileId: 'cust_prof_1',
        },
    });
    it('attaches the socket server to the delivery service on init', () => {
        const messageDeliveryService = {
            attachServer: jest.fn(),
        };
        const gateway = new messaging_gateway_1.MessagingGateway({}, {}, {}, {}, messageDeliveryService);
        const server = {};
        gateway.afterInit(server);
        expect(messageDeliveryService.attachServer).toHaveBeenCalledWith(server);
    });
    it('authenticates incoming socket connections and stores the actor context', async () => {
        const socketAuthService = {
            authenticateClient: jest.fn().mockResolvedValue(currentUser),
        };
        const gateway = new messaging_gateway_1.MessagingGateway(socketAuthService, {}, {}, {}, {});
        const client = {
            data: {},
        };
        await gateway.handleConnection(client);
        expect(socketAuthService.authenticateClient).toHaveBeenCalledWith(client);
        expect(client.data.currentUser).toEqual(currentUser);
    });
    it('disconnects unauthorized socket connections', async () => {
        const socketAuthService = {
            authenticateClient: jest.fn().mockRejectedValue(new Error('bad token')),
        };
        const gateway = new messaging_gateway_1.MessagingGateway(socketAuthService, {}, {}, {}, {});
        const client = {
            data: {},
            disconnect: jest.fn(),
        };
        await gateway.handleConnection(client);
        expect(client.disconnect).toHaveBeenCalledWith(true);
    });
    it('joins a conversation room after access validation', async () => {
        const conversationReadService = {
            getCurrentUserConversation: jest.fn().mockResolvedValue({
                conversationId: 'con_1',
            }),
        };
        const gateway = new messaging_gateway_1.MessagingGateway({}, conversationReadService, {}, {}, {});
        const client = {
            data: {
                currentUser,
            },
            join: jest.fn(),
        };
        const result = await gateway.handleJoin(client, {
            conversationId: 'con_1',
        });
        expect(conversationReadService.getCurrentUserConversation).toHaveBeenCalledWith(currentUser, 'con_1');
        expect(client.join).toHaveBeenCalledWith('con_1');
        expect(result).toMatchObject({
            conversationId: 'con_1',
            joined: true,
        });
    });
    it('delegates socket message sends to the message service', async () => {
        const messageService = {
            send: jest.fn().mockResolvedValue({
                messageId: 'msg_1',
                conversationId: 'con_1',
            }),
        };
        const gateway = new messaging_gateway_1.MessagingGateway({}, {}, messageService, {}, {});
        const client = {
            data: {
                currentUser,
            },
        };
        const result = await gateway.handleSend(client, {
            conversationId: 'con_1',
            body: 'Hello',
        });
        expect(messageService.send).toHaveBeenCalledWith(currentUser, {
            conversationId: 'con_1',
            body: 'Hello',
        });
        expect(result).toMatchObject({
            messageId: 'msg_1',
        });
    });
    it('delegates socket read receipts to the receipt service', async () => {
        const messageReceiptService = {
            markMessageRead: jest.fn().mockResolvedValue({
                conversationId: 'con_1',
                messageId: 'msg_1',
            }),
        };
        const gateway = new messaging_gateway_1.MessagingGateway({}, {}, {}, messageReceiptService, {});
        const client = {
            data: {
                currentUser,
            },
        };
        const result = await gateway.handleMarkRead(client, {
            messageId: 'msg_1',
        });
        expect(messageReceiptService.markMessageRead).toHaveBeenCalledWith(currentUser, 'msg_1');
        expect(result).toMatchObject({
            conversationId: 'con_1',
        });
    });
    it('throws when websocket events are received without an authenticated actor', async () => {
        const gateway = new messaging_gateway_1.MessagingGateway({}, {}, {}, {}, {});
        await expect(gateway.handleSend({ data: {} }, {
            conversationId: 'con_1',
            body: 'Hello',
        })).rejects.toBeInstanceOf(websockets_1.WsException);
    });
});
//# sourceMappingURL=messaging.gateway.spec.js.map