"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const audit_event_service_1 = require("../../../../src/modules/audit/services/audit-event.service");
const system_authenticated_actor_helper_1 = require("../../../../src/modules/auth/entities/system-authenticated-actor.helper");
function makeCurrentUser() {
    return {
        userId: 'usr_admin_1',
        sessionId: 'session_1',
        role: client_1.UserRole.ADMIN,
        tokenType: 'access',
        actorContext: {
            userId: 'usr_admin_1',
            phone: '099999999',
            role: client_1.UserRole.ADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
    };
}
function makeOrder() {
    return {
        orderId: 'order_1',
        orderCode: 'ORD-001',
        status: 'RIDER_ASSIGNED',
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
    };
}
function makeConversation() {
    return {
        conversationId: 'con_1',
        orderId: 'order_1',
        type: client_1.ConversationType.ORDER_CHAT,
        title: 'Order Chat',
        lastMessageId: null,
        lastMessageAt: null,
        createdAt: '2026-04-23T10:00:00.000Z',
        updatedAt: '2026-04-23T10:00:00.000Z',
        participants: [
            {
                participantKey: 'user:usr_admin_1',
                userId: 'usr_admin_1',
                roleAtJoin: client_1.ConversationParticipantRole.ADMIN,
                canSendMessages: true,
                canSendAttachments: true,
                canSendProofs: false,
                canModerate: true,
                joinedAt: '2026-04-23T10:00:00.000Z',
                leftAt: null,
            },
        ],
    };
}
function makeMessage() {
    return {
        messageId: 'msg_1',
        conversationId: 'con_1',
        senderKind: 'SYSTEM',
        senderId: null,
        type: client_1.MessageType.SYSTEM_EVENT,
        systemEventCode: client_1.SystemMessageCode.RIDER_ASSIGNED,
        body: 'Rider assigned.',
        metadataJson: null,
        deletedAt: null,
        createdAt: '2026-04-23T10:01:00.000Z',
        receipts: [],
        attachments: [],
    };
}
describe('AuditEventService', () => {
    it('logs order events with mapped actions', async () => {
        const auditService = {
            logAction: jest.fn().mockResolvedValue(undefined),
        };
        const service = new audit_event_service_1.AuditEventService(auditService);
        await service.publishOrderEvent({
            currentUser: makeCurrentUser(),
            order: makeOrder(),
            conversation: makeConversation(),
            message: makeMessage(),
            code: client_1.SystemMessageCode.RIDER_ASSIGNED,
            metadataJson: {
                deliveryId: 'delivery_1',
            },
        });
        expect(auditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
            action: 'dispatch.rider_assigned',
            resourceType: 'DELIVERY',
            orderId: 'order_1',
            conversationId: 'con_1',
            messageId: 'msg_1',
        }));
    });
    it('logs user message events against the message resource', async () => {
        const auditService = {
            logAction: jest.fn().mockResolvedValue(undefined),
        };
        const service = new audit_event_service_1.AuditEventService(auditService);
        await service.publishConversationMessage({
            currentUser: makeCurrentUser(),
            order: makeOrder(),
            conversation: makeConversation(),
            message: {
                ...makeMessage(),
                senderKind: 'USER',
                senderId: 'usr_admin_1',
                type: client_1.MessageType.TEXT,
                systemEventCode: null,
            },
        });
        expect(auditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
            action: 'messaging.message_sent',
            resourceType: 'MESSAGE',
            resourceId: 'msg_1',
        }));
    });
    it('maps payment system events to the payment audit resource', async () => {
        const auditService = {
            logAction: jest.fn().mockResolvedValue(undefined),
        };
        const service = new audit_event_service_1.AuditEventService(auditService);
        await service.publishOrderEvent({
            currentUser: makeCurrentUser(),
            order: makeOrder(),
            conversation: makeConversation(),
            message: {
                ...makeMessage(),
                systemEventCode: client_1.SystemMessageCode.PAYMENT_SUCCEEDED,
            },
            code: client_1.SystemMessageCode.PAYMENT_SUCCEEDED,
            metadataJson: {
                paymentId: 'payment_1',
            },
        });
        expect(auditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
            action: 'payments.succeeded',
            resourceType: 'PAYMENT',
            resourceId: 'payment_1',
        }));
    });
    it('maps refund system events to the refund audit resource', async () => {
        const auditService = {
            logAction: jest.fn().mockResolvedValue(undefined),
        };
        const service = new audit_event_service_1.AuditEventService(auditService);
        await service.publishOrderEvent({
            currentUser: makeCurrentUser(),
            order: makeOrder(),
            conversation: makeConversation(),
            message: {
                ...makeMessage(),
                systemEventCode: client_1.SystemMessageCode.REFUND_SUCCEEDED,
            },
            code: client_1.SystemMessageCode.REFUND_SUCCEEDED,
            metadataJson: {
                refundId: 'refund_1',
                paymentId: 'payment_1',
            },
        });
        expect(auditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
            action: 'refunds.succeeded',
            resourceType: 'REFUND',
            resourceId: 'refund_1',
        }));
    });
    it('logs virtual system actors without a user foreign key', async () => {
        const auditService = {
            logAction: jest.fn().mockResolvedValue(undefined),
        };
        const service = new audit_event_service_1.AuditEventService(auditService);
        await service.publishOrderEvent({
            currentUser: (0, system_authenticated_actor_helper_1.createSystemAuthenticatedActor)('payment-provider-webhook'),
            order: makeOrder(),
            conversation: makeConversation(),
            message: {
                ...makeMessage(),
                systemEventCode: client_1.SystemMessageCode.PAYMENT_SUCCEEDED,
            },
            code: client_1.SystemMessageCode.PAYMENT_SUCCEEDED,
            metadataJson: {
                paymentId: 'payment_1',
            },
        });
        expect(auditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
            actorType: client_1.AuditActorType.SYSTEM,
            actorUserId: null,
            actorRole: null,
            actionSource: client_1.AuditActionSource.SYSTEM,
            metadataJson: expect.objectContaining({
                systemActorId: 'system:payment-provider-webhook',
            }),
        }));
    });
});
//# sourceMappingURL=audit-event.service.spec.js.map