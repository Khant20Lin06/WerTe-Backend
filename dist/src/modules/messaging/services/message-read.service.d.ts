import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ConversationMessageListEntity } from '../entities/conversation-message-list.entity';
import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository } from '../repositories/message.repository';
import { MessagingPolicyService } from './message-policy.service';
export declare class MessageReadService {
    private readonly conversationRepository;
    private readonly messageRepository;
    private readonly messagingPolicyService;
    constructor(conversationRepository: ConversationRepository, messageRepository: MessageRepository, messagingPolicyService: MessagingPolicyService);
    listCurrentUserConversationMessages(currentUser: AuthenticatedUserEntity, input: {
        conversationId: string;
        cursor?: string;
        limit?: number;
    }): Promise<ConversationMessageListEntity>;
}
