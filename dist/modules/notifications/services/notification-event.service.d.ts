import { SystemMessageCode } from '@prisma/client';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ConversationOrderContextEntity } from '../../messaging/entities/conversation-order-context.entity';
import { ResolvedConversationEntity } from '../../messaging/entities/resolved-conversation.entity';
import { SentMessageEntity } from '../../messaging/entities/sent-message.entity';
import { NotificationsService } from './notifications.service';
export declare class NotificationEventService {
    private readonly notificationsService;
    private readonly queueService;
    constructor(notificationsService: NotificationsService, queueService: QueueService);
    publishOrderEvent(input: {
        currentUser: AuthenticatedUserEntity;
        order: ConversationOrderContextEntity;
        conversation: ResolvedConversationEntity;
        message: SentMessageEntity;
        code: SystemMessageCode;
    }): Promise<void>;
    publishConversationMessage(input: {
        currentUser: AuthenticatedUserEntity;
        order: ConversationOrderContextEntity | null;
        conversation: ResolvedConversationEntity;
        message: SentMessageEntity;
    }): Promise<void>;
    private resolveRecipientUserIds;
    private mapSystemMessageCodeToNotificationType;
    private buildOrderNotificationTitle;
    private buildConversationMessageTitle;
    private buildConversationMessageBody;
    private humanizeRole;
    private recordDefaultDeliveries;
}
