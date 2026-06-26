"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const system_message_service_1 = require("../../../../src/modules/messaging/services/system-message.service");
function makeOrderContext(overrides) {
    return {
        orderId: 'order_1',
        orderCode: 'ORD-00000001',
        status: client_1.OrderStatus.RIDER_ASSIGNED,
        customer: {
            customerProfileId: 'cust_prof_1',
            userId: 'usr_customer_1',
        },
        merchant: {
            merchantId: 'merchant_1',
            userId: 'usr_merchant_1',
            merchantName: 'Demo Merchant',
        },
        branch: {
            branchName: 'Downtown Branch',
        },
        rider: {
            riderId: 'rider_1',
            userId: 'usr_rider_1',
            displayName: 'Ko Aung',
        },
        ...overrides,
    };
}
function makeSentMessage(overrides) {
    return {
        messageId: 'msg_1',
        conversationId: 'con_1',
        senderKind: 'SYSTEM',
        senderId: null,
        type: 'SYSTEM_EVENT',
        systemEventCode: client_1.SystemMessageCode.ORDER_ACCEPTED,
        body: 'Demo Merchant accepted the order.',
        metadataJson: null,
        deletedAt: null,
        createdAt: '2026-04-19T10:05:00.000Z',
        receipts: [],
        attachments: [],
        ...overrides,
    };
}
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
            {
                participantKey: 'user:usr_merchant_1',
                userId: 'usr_merchant_1',
                roleAtJoin: client_1.ConversationParticipantRole.MERCHANT,
                canSendMessages: true,
                canSendAttachments: true,
                canSendProofs: true,
                canModerate: false,
                joinedAt: '2026-04-19T10:00:00.000Z',
                leftAt: null,
            },
            {
                participantKey: 'user:usr_rider_1',
                userId: 'usr_rider_1',
                roleAtJoin: client_1.ConversationParticipantRole.RIDER,
                canSendMessages: true,
                canSendAttachments: true,
                canSendProofs: true,
                canModerate: false,
                joinedAt: '2026-04-19T10:00:00.000Z',
                leftAt: null,
            },
            {
                participantKey: 'system:order-chat',
                userId: null,
                roleAtJoin: client_1.ConversationParticipantRole.SYSTEM,
                canSendMessages: false,
                canSendAttachments: false,
                canSendProofs: false,
                canModerate: false,
                joinedAt: '2026-04-19T10:00:00.000Z',
                leftAt: null,
            },
        ],
        ...overrides,
    };
}
describe('SystemMessageService', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_merchant_1',
        role: client_1.UserRole.MERCHANT,
        actorContext: {
            userId: 'usr_merchant_1',
            phone: '0942000000',
            role: client_1.UserRole.MERCHANT,
            status: client_1.UserStatus.ACTIVE,
            merchantId: 'merchant_1',
        },
    });
    it('publishes a rendered system event message into the resolved order chat', async () => {
        const logger = {
            warnEvent: jest.fn(),
        };
        const conversationRepository = {
            findOrderContextById: jest.fn().mockResolvedValue(makeOrderContext()),
            resolve: jest.fn().mockResolvedValue(makeResolvedConversation()),
        };
        const messagePolicyService = {
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
                .mockReturnValue('ORD-00000001 order_chat'),
        };
        const messageRepository = {
            createSystemEvent: jest.fn().mockResolvedValue(makeSentMessage()),
        };
        const deliveryService = {
            emitMessageCreated: jest.fn(),
            emitConversationUpdated: jest.fn(),
            queuePushFallback: jest.fn().mockResolvedValue(undefined),
        };
        const notificationEventService = {
            publishOrderEvent: jest.fn().mockResolvedValue(undefined),
        };
        const auditEventService = {
            publishOrderEvent: jest.fn().mockResolvedValue(undefined),
        };
        const templateService = {
            render: jest.fn().mockResolvedValue('Demo Merchant accepted the order.'),
        };
        const service = new system_message_service_1.SystemMessageService(logger, conversationRepository, messagePolicyService, messageRepository, deliveryService, templateService, notificationEventService, auditEventService);
        await service.publishOrderEvent(currentUser, {
            orderId: 'order_1',
            code: client_1.SystemMessageCode.ORDER_ACCEPTED,
            metadata: {
                actorUserId: currentUser.userId,
            },
            templateVariables: {
                merchantName: 'Demo Merchant',
            },
        });
        expect(templateService.render).toHaveBeenCalledWith(client_1.SystemMessageCode.ORDER_ACCEPTED, expect.objectContaining({
            orderCode: 'ORD-00000001',
            merchantName: 'Demo Merchant',
            branchName: 'Downtown Branch',
            riderName: 'Ko Aung',
        }));
        expect(messageRepository.createSystemEvent).toHaveBeenCalledWith({
            conversationId: 'con_1',
            systemEventCode: client_1.SystemMessageCode.ORDER_ACCEPTED,
            body: 'Demo Merchant accepted the order.',
            metadataJson: {
                actorUserId: currentUser.userId,
            },
            receiptUserIds: ['usr_customer_1', 'usr_merchant_1', 'usr_rider_1'],
        });
        expect(deliveryService.emitMessageCreated).toHaveBeenCalled();
        expect(deliveryService.emitConversationUpdated).toHaveBeenCalledWith('con_1');
        expect(deliveryService.queuePushFallback).toHaveBeenCalledWith('con_1');
        expect(notificationEventService.publishOrderEvent).toHaveBeenCalled();
        expect(auditEventService.publishOrderEvent).toHaveBeenCalled();
    });
    it('swallows publish failures and logs a warning event', async () => {
        const logger = {
            warnEvent: jest.fn(),
        };
        const templateService = {
            render: jest.fn().mockRejectedValue(new Error('template render failed')),
        };
        const service = new system_message_service_1.SystemMessageService(logger, {
            findOrderContextById: jest.fn().mockResolvedValue(makeOrderContext()),
            resolve: jest.fn().mockResolvedValue(makeResolvedConversation()),
        }, {
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
            ]),
            buildConversationTitle: jest.fn().mockReturnValue('ORD-00000001 order_chat'),
        }, {}, {
            emitMessageCreated: jest.fn(),
            emitConversationUpdated: jest.fn(),
            queuePushFallback: jest.fn().mockResolvedValue(undefined),
        }, templateService, {
            publishOrderEvent: jest.fn().mockResolvedValue(undefined),
        }, {
            publishOrderEvent: jest.fn().mockResolvedValue(undefined),
        });
        await expect(service.publishOrderEvent(currentUser, {
            orderId: 'order_1',
            code: client_1.SystemMessageCode.ORDER_ACCEPTED,
        })).resolves.toBeUndefined();
        expect(logger.warnEvent).toHaveBeenCalledWith('System order event message could not be published.', expect.objectContaining({
            orderId: 'order_1',
            code: client_1.SystemMessageCode.ORDER_ACCEPTED,
            actorUserId: currentUser.userId,
        }), 'SystemMessageService');
    });
});
//# sourceMappingURL=system-message.service.spec.js.map