import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MarkedMessageReadEntity } from '../entities/marked-message-read.entity';
import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository } from '../repositories/message.repository';
import { MessageDeliveryService } from './message-delivery.service';
import { MessagingPolicyService } from './message-policy.service';
export declare class MessageReceiptService {
    private readonly conversationRepository;
    private readonly messageRepository;
    private readonly messagingPolicyService;
    private readonly messageDeliveryService;
    constructor(conversationRepository: ConversationRepository, messageRepository: MessageRepository, messagingPolicyService: MessagingPolicyService, messageDeliveryService: MessageDeliveryService);
    markMessageRead(currentUser: AuthenticatedUserEntity, messageId: string): Promise<MarkedMessageReadEntity>;
}
