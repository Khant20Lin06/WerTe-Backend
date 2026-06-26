import { AuditEventService } from '../../audit/services/audit-event.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
import { SentMessageEntity } from '../entities/sent-message.entity';
import { SendMessageDto } from '../dto/send-message.dto';
import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository } from '../repositories/message.repository';
import { MessageDeliveryService } from './message-delivery.service';
import { MessagingPolicyService } from './message-policy.service';
export declare class MessageService {
    private readonly conversationRepository;
    private readonly messageRepository;
    private readonly messagingPolicyService;
    private readonly messageDeliveryService;
    private readonly notificationEventService;
    private readonly auditEventService;
    constructor(conversationRepository: ConversationRepository, messageRepository: MessageRepository, messagingPolicyService: MessagingPolicyService, messageDeliveryService: MessageDeliveryService, notificationEventService: NotificationEventService, auditEventService: AuditEventService);
    send(currentUser: AuthenticatedUserEntity, dto: SendMessageDto): Promise<SentMessageEntity>;
    private resolveMessageType;
    private mapAttachments;
    private assertValidPayload;
    private resolveExpectedAttachmentType;
    private resolveAttachmentVisibility;
}
