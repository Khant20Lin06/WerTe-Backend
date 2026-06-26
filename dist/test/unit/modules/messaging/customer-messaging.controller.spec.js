"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const customer_messaging_controller_1 = require("../../../../src/modules/messaging/controllers/customer-messaging.controller");
const create_conversation_dto_1 = require("../../../../src/modules/messaging/dto/create-conversation.dto");
describe('CustomerMessagingController', () => {
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
    it('delegates order conversation resolution to the messaging rest service', async () => {
        const messagingRestService = {
            resolveCurrentUserConversationForOrder: jest.fn().mockResolvedValue({
                conversationId: 'con_1',
                orderId: 'order_1',
            }),
        };
        const controller = new customer_messaging_controller_1.CustomerMessagingController(messagingRestService);
        const result = await controller.resolveConversation(currentUser, 'order_1', {
            type: create_conversation_dto_1.ConversationTypeValue.orderChat,
        });
        expect(messagingRestService.resolveCurrentUserConversationForOrder).toHaveBeenCalledWith(currentUser, 'order_1', {
            type: create_conversation_dto_1.ConversationTypeValue.orderChat,
        });
        expect(result).toMatchObject({
            conversationId: 'con_1',
            orderId: 'order_1',
        });
    });
    it('delegates message sends with the conversation path parameter', async () => {
        const messagingRestService = {
            sendCurrentUserMessage: jest.fn().mockResolvedValue({
                messageId: 'msg_1',
                conversationId: 'con_1',
                type: client_1.MessageType.TEXT,
            }),
        };
        const controller = new customer_messaging_controller_1.CustomerMessagingController(messagingRestService);
        const result = await controller.sendMessage(currentUser, 'con_1', {
            body: 'Hello there.',
        });
        expect(messagingRestService.sendCurrentUserMessage).toHaveBeenCalledWith(currentUser, 'con_1', {
            body: 'Hello there.',
        });
        expect(result).toMatchObject({
            messageId: 'msg_1',
            conversationId: 'con_1',
        });
    });
    it('delegates read receipt updates to the messaging rest service', async () => {
        const messagingRestService = {
            markCurrentUserMessageRead: jest.fn().mockResolvedValue({
                conversationId: 'con_1',
                messageId: 'msg_1',
                readAt: '2026-04-20T10:30:00.000Z',
            }),
        };
        const controller = new customer_messaging_controller_1.CustomerMessagingController(messagingRestService);
        const result = await controller.markRead(currentUser, 'msg_1');
        expect(messagingRestService.markCurrentUserMessageRead).toHaveBeenCalledWith(currentUser, 'msg_1');
        expect(result).toMatchObject({
            conversationId: 'con_1',
            messageId: 'msg_1',
        });
    });
});
//# sourceMappingURL=customer-messaging.controller.spec.js.map