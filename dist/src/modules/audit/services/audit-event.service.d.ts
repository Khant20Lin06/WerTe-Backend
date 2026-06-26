import { SystemMessageCode } from '@prisma/client';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ConversationOrderContextEntity } from '../../messaging/entities/conversation-order-context.entity';
import { ResolvedConversationEntity } from '../../messaging/entities/resolved-conversation.entity';
import { SentMessageEntity } from '../../messaging/entities/sent-message.entity';
import { AuditService } from './audit.service';
export declare class AuditEventService {
    private readonly auditService;
    constructor(auditService: AuditService);
    publishOrderEvent(input: {
        currentUser: AuthenticatedUserEntity;
        order: ConversationOrderContextEntity;
        conversation: ResolvedConversationEntity;
        message: SentMessageEntity;
        code: SystemMessageCode;
        metadataJson?: unknown;
    }): Promise<void>;
    publishConversationMessage(input: {
        currentUser: AuthenticatedUserEntity;
        order: ConversationOrderContextEntity | null;
        conversation: ResolvedConversationEntity;
        message: SentMessageEntity;
    }): Promise<void>;
    private mapSystemMessageCodeToAuditAction;
    private resolveOrderEventResource;
    private normalizeMetadata;
    private readMetadataString;
}
