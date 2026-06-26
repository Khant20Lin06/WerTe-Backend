import { Prisma, SystemMessageCode } from '@prisma/client';
import { AppLogger } from '../../../infrastructure/logging/app.logger';
import { AuditEventService } from '../../audit/services/audit-event.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
import { MessagePolicyService } from '../policies/message-policy.service';
import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository } from '../repositories/message.repository';
import { MessageDeliveryService } from './message-delivery.service';
import { SystemMessageTemplateService } from './system-message-template.service';
type PublishOrderEventInput = {
    orderId: string;
    code: SystemMessageCode;
    metadata?: Prisma.InputJsonValue;
    templateVariables?: Record<string, string | null | undefined>;
};
export declare class SystemMessageService {
    private readonly logger;
    private readonly conversationRepository;
    private readonly messagePolicyService;
    private readonly messageRepository;
    private readonly messageDeliveryService;
    private readonly templateService;
    private readonly notificationEventService;
    private readonly auditEventService;
    constructor(logger: AppLogger, conversationRepository: ConversationRepository, messagePolicyService: MessagePolicyService, messageRepository: MessageRepository, messageDeliveryService: MessageDeliveryService, templateService: SystemMessageTemplateService, notificationEventService: NotificationEventService, auditEventService: AuditEventService);
    publishOrderEvent(currentUser: AuthenticatedUserEntity, input: PublishOrderEventInput): Promise<void>;
    private publishOrderEventOrThrow;
    private publishSideEffects;
}
export {};
