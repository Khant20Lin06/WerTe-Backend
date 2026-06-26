"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const conversation_service_1 = require("../../../../src/modules/messaging/services/conversation.service");
const create_conversation_dto_1 = require("../../../../src/modules/messaging/dto/create-conversation.dto");
function makeOrderContext(overrides) {
    return {
        orderId: 'order_1',
        orderCode: 'ORD-00000001',
        status: client_1.OrderStatus.PLACED,
        customer: {
            customerProfileId: 'cust_prof_1',
            userId: 'usr_customer_1',
        },
        merchant: {
            merchantId: 'merchant_1',
            userId: 'usr_merchant_1',
            merchantName: 'Merchant One',
        },
        branch: {
            branchName: 'Downtown Branch',
        },
        rider: null,
        ...overrides,
    };
}
function makeResolvedConversation(overrides) {
    return {
        conversationId: 'con_1',
        orderId: 'order_1',
        type: client_1.ConversationType.CUSTOMER_MERCHANT,
        title: 'ORD-00000001 customer_merchant',
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
describe('ConversationService', () => {
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
        type: create_conversation_dto_1.ConversationTypeValue.customerMerchant,
    };
    it('resolves a conversation lane with policy-derived participants', async () => {
        const conversationRepository = {
            findOrderContextById: jest.fn().mockResolvedValue(makeOrderContext()),
            resolve: jest.fn().mockResolvedValue(makeResolvedConversation()),
        };
        const messagePolicyService = {
            canResolveConversation: jest.fn().mockReturnValue(true),
            buildConversationParticipants: jest.fn().mockReturnValue([
                {
                    participantKey: 'user:usr_customer_1',
                    userId: 'usr_customer_1',
                    roleAtJoin: client_1.ConversationParticipantRole.CUSTOMER,
                    canSendMessages: true,
                    canSendAttachments: true,
                    canSendProofs: false,
                    canModerate: false,
                },
                {
                    participantKey: 'user:usr_merchant_1',
                    userId: 'usr_merchant_1',
                    roleAtJoin: client_1.ConversationParticipantRole.MERCHANT,
                    canSendMessages: true,
                    canSendAttachments: true,
                    canSendProofs: true,
                    canModerate: false,
                },
            ]),
            buildConversationTitle: jest
                .fn()
                .mockReturnValue('ORD-00000001 customer_merchant'),
        };
        const service = new conversation_service_1.ConversationService(conversationRepository, messagePolicyService);
        const result = await service.resolve(currentUser, dto);
        expect(conversationRepository.findOrderContextById).toHaveBeenCalledWith('order_1');
        expect(messagePolicyService.canResolveConversation).toHaveBeenCalledWith(currentUser, expect.objectContaining({
            orderId: 'order_1',
        }), client_1.ConversationType.CUSTOMER_MERCHANT);
        expect(conversationRepository.resolve).toHaveBeenCalledWith({
            orderId: 'order_1',
            type: client_1.ConversationType.CUSTOMER_MERCHANT,
            title: 'ORD-00000001 customer_merchant',
            participants: expect.any(Array),
        });
        expect(result).toMatchObject({
            conversationId: 'con_1',
            type: client_1.ConversationType.CUSTOMER_MERCHANT,
        });
    });
    it('rejects unavailable rider lane before attempting resolution', async () => {
        const conversationRepository = {
            findOrderContextById: jest.fn().mockResolvedValue(makeOrderContext()),
            resolve: jest.fn(),
        };
        const service = new conversation_service_1.ConversationService(conversationRepository, {});
        await expect(service.resolve(currentUser, {
            orderId: 'order_1',
            type: create_conversation_dto_1.ConversationTypeValue.customerRider,
        })).rejects.toBeInstanceOf(app_exception_1.AppException);
        expect(conversationRepository.resolve).not.toHaveBeenCalled();
    });
    it('rejects forbidden conversation lanes for the actor', async () => {
        const conversationRepository = {
            findOrderContextById: jest.fn().mockResolvedValue(makeOrderContext()),
            resolve: jest.fn(),
        };
        const messagePolicyService = {
            canResolveConversation: jest.fn().mockReturnValue(false),
        };
        const service = new conversation_service_1.ConversationService(conversationRepository, messagePolicyService);
        await expect(service.resolve(currentUser, dto)).rejects.toBeInstanceOf(app_exception_1.AppException);
        expect(conversationRepository.resolve).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=conversation.service.spec.js.map