"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const messages_controller_1 = require("../../../../src/modules/messaging/controllers/messages.controller");
function makeSentMessage(overrides) {
    return {
        messageId: 'msg_1',
        conversationId: 'con_1',
        senderKind: 'USER',
        senderId: 'usr_customer_1',
        type: client_1.MessageType.TEXT,
        systemEventCode: null,
        body: 'Heading out now.',
        metadataJson: null,
        deletedAt: null,
        createdAt: '2026-04-19T10:00:00.000Z',
        receipts: [],
        attachments: [],
        ...overrides,
    };
}
describe('MessagesController', () => {
    it('delegates sends to the authenticated message service', async () => {
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
        const messageService = {
            send: jest.fn().mockResolvedValue(makeSentMessage()),
        };
        const controller = new messages_controller_1.MessagesController(messageService);
        const result = await controller.send(currentUser, {
            conversationId: 'con_1',
            body: 'Heading out now.',
        });
        expect(messageService.send).toHaveBeenCalledWith(currentUser, {
            conversationId: 'con_1',
            body: 'Heading out now.',
        });
        expect(result).toMatchObject({
            messageId: 'msg_1',
            conversationId: 'con_1',
        });
    });
});
//# sourceMappingURL=messages.controller.spec.js.map