import { ConversationParticipantRole, ConversationType } from '@prisma/client';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ConversationOrderContextEntity } from '../entities/conversation-order-context.entity';
export type ConversationParticipantSpec = {
    participantKey: string;
    userId?: string | null;
    roleAtJoin: ConversationParticipantRole;
    canSendMessages: boolean;
    canSendAttachments: boolean;
    canSendProofs: boolean;
    canModerate: boolean;
};
type ConversationResolutionInput = {
    currentUser: AuthenticatedUserEntity;
    order: ConversationOrderContextEntity;
    type: ConversationType;
};
export declare function canResolveConversationForOrder({ currentUser, order, type, }: ConversationResolutionInput): boolean;
export declare function buildConversationParticipants({ currentUser, order, type, }: ConversationResolutionInput): ConversationParticipantSpec[] | null;
export declare function buildConversationTitle(order: ConversationOrderContextEntity, type: ConversationType): string;
export {};
