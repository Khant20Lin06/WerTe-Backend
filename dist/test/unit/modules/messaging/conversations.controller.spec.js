"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const conversations_controller_1 = require("../../../../src/modules/messaging/controllers/conversations.controller");
const create_conversation_dto_1 = require("../../../../src/modules/messaging/dto/create-conversation.dto");
function makeResolvedConversation(overrides) {
    return {
        conversationId: 'con_1',
        orderId: 'order_1',
        type: client_1.ConversationType.ORDER_CHAT,
        title: 'ORD-00000001 order_chat',
        lastMessageId: null,
        lastMessageAt: null,
        createdAt: '2026-04-19T10:00:00.000Z',
        updatedAt: '2026-04-19T10:00:00.000Z',
        participants: [
            {
                participantKey: 'user:usr_customer_1',
                userId: 'usr_customer_1',
                roleAtJoin: client_1.ConversationParticipantRole.CUSTOMER,
                canSendMessages: true,
                canSendAttachments: true,
                canSendProofs: false,
                canModerate: false,
                joinedAt: '2026-04-19T10:00:00.000Z',
                leftAt: null,
            },
        ],
        ...overrides,
    };
}
describe('ConversationsController', () => {
    it('delegates conversation resolution to the authenticated conversation service', async () => {
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
        const dto = {
            orderId: 'order_1',
            type: create_conversation_dto_1.ConversationTypeValue.orderChat,
        };
        const conversationService = {
            resolve: jest.fn().mockResolvedValue(makeResolvedConversation()),
        };
        const controller = new conversations_controller_1.ConversationsController(conversationService);
        const result = await controller.create(currentUser, dto);
        expect(conversationService.resolve).toHaveBeenCalledWith(currentUser, dto);
        expect(result).toMatchObject({
            conversationId: 'con_1',
            type: client_1.ConversationType.ORDER_CHAT,
        });
    });
});
//# sourceMappingURL=conversations.controller.spec.js.map