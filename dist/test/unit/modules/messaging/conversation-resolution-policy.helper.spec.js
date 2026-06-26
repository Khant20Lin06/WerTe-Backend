"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const conversation_resolution_policy_helper_1 = require("../../../../src/modules/messaging/policies/conversation-resolution-policy.helper");
const system_authenticated_actor_helper_1 = require("../../../../src/modules/auth/entities/system-authenticated-actor.helper");
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
            merchantName: 'Merchant One',
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
describe('conversation resolution policy helper', () => {
    it('allows customer-owned order chat resolution and includes system participant', () => {
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
        const order = makeOrderContext();
        expect((0, conversation_resolution_policy_helper_1.canResolveConversationForOrder)({
            currentUser,
            order,
            type: client_1.ConversationType.ORDER_CHAT,
        })).toBe(true);
        expect((0, conversation_resolution_policy_helper_1.buildConversationParticipants)({
            currentUser,
            order,
            type: client_1.ConversationType.ORDER_CHAT,
        })).toEqual(expect.arrayContaining([
            expect.objectContaining({
                participantKey: 'user:usr_customer_1',
                roleAtJoin: client_1.ConversationParticipantRole.CUSTOMER,
            }),
            expect.objectContaining({
                participantKey: 'system:order-chat',
                roleAtJoin: client_1.ConversationParticipantRole.SYSTEM,
            }),
        ]));
    });
    it('denies merchant-rider lane when no assigned rider exists', () => {
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
        const order = makeOrderContext({
            rider: null,
        });
        expect((0, conversation_resolution_policy_helper_1.canResolveConversationForOrder)({
            currentUser,
            order,
            type: client_1.ConversationType.MERCHANT_RIDER,
        })).toBe(false);
        expect((0, conversation_resolution_policy_helper_1.buildConversationParticipants)({
            currentUser,
            order,
            type: client_1.ConversationType.MERCHANT_RIDER,
        })).toBeNull();
    });
    it('allows support actor to resolve customer operations lane and adds support participant', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_support_1',
            role: client_1.UserRole.SUPPORT,
            actorContext: {
                userId: 'usr_support_1',
                phone: '0991111111',
                role: client_1.UserRole.SUPPORT,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        const order = makeOrderContext();
        expect((0, conversation_resolution_policy_helper_1.canResolveConversationForOrder)({
            currentUser,
            order,
            type: client_1.ConversationType.CUSTOMER_OPERATIONS,
        })).toBe(true);
        expect((0, conversation_resolution_policy_helper_1.buildConversationParticipants)({
            currentUser,
            order,
            type: client_1.ConversationType.CUSTOMER_OPERATIONS,
        })).toEqual(expect.arrayContaining([
            expect.objectContaining({
                participantKey: 'user:usr_customer_1',
                roleAtJoin: client_1.ConversationParticipantRole.CUSTOMER,
            }),
            expect.objectContaining({
                participantKey: 'user:usr_support_1',
                roleAtJoin: client_1.ConversationParticipantRole.SUPPORT,
                canModerate: true,
            }),
        ]));
    });
    it('adds the operations actor into order chat with moderation privileges', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_support_1',
            role: client_1.UserRole.SUPPORT,
            actorContext: {
                userId: 'usr_support_1',
                phone: '0991111111',
                role: client_1.UserRole.SUPPORT,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        const order = makeOrderContext();
        const participants = (0, conversation_resolution_policy_helper_1.buildConversationParticipants)({
            currentUser,
            order,
            type: client_1.ConversationType.ORDER_CHAT,
        });
        expect(participants).toEqual(expect.arrayContaining([
            expect.objectContaining({
                participantKey: 'system:order-chat',
                roleAtJoin: client_1.ConversationParticipantRole.SYSTEM,
            }),
            expect.objectContaining({
                participantKey: 'user:usr_support_1',
                roleAtJoin: client_1.ConversationParticipantRole.SUPPORT,
                canModerate: true,
            }),
        ]));
    });
    it('allows system operations actors to resolve order chat without adding a fake user participant', () => {
        const currentUser = (0, system_authenticated_actor_helper_1.createSystemAuthenticatedActor)('payment-provider-webhook');
        const order = makeOrderContext();
        expect((0, conversation_resolution_policy_helper_1.canResolveConversationForOrder)({
            currentUser,
            order,
            type: client_1.ConversationType.ORDER_CHAT,
        })).toBe(true);
        expect((0, conversation_resolution_policy_helper_1.buildConversationParticipants)({
            currentUser,
            order,
            type: client_1.ConversationType.ORDER_CHAT,
        })).toEqual(expect.arrayContaining([
            expect.objectContaining({
                participantKey: 'system:order-chat',
                roleAtJoin: client_1.ConversationParticipantRole.SYSTEM,
            }),
        ]));
        expect((0, conversation_resolution_policy_helper_1.buildConversationParticipants)({
            currentUser,
            order,
            type: client_1.ConversationType.ORDER_CHAT,
        })).not.toEqual(expect.arrayContaining([
            expect.objectContaining({
                participantKey: 'user:system:payment-provider-webhook',
            }),
        ]));
    });
});
//# sourceMappingURL=conversation-resolution-policy.helper.spec.js.map