import { Injectable } from '@nestjs/common';
import { ConversationType, Prisma, SystemMessageCode } from '@prisma/client';

import { AppLogger } from '../../../infrastructure/logging/app.logger';
import { AuditEventService } from '../../audit/services/audit-event.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
import { ConversationOrderContextEntity } from '../entities/conversation-order-context.entity';
import { ResolvedConversationEntity } from '../entities/resolved-conversation.entity';
import { SentMessageEntity } from '../entities/sent-message.entity';
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

@Injectable()
export class SystemMessageService {
  constructor(
    private readonly logger: AppLogger,
    private readonly conversationRepository: ConversationRepository,
    private readonly messagePolicyService: MessagePolicyService,
    private readonly messageRepository: MessageRepository,
    private readonly messageDeliveryService: MessageDeliveryService,
    private readonly templateService: SystemMessageTemplateService,
    private readonly notificationEventService: NotificationEventService,
    private readonly auditEventService: AuditEventService,
  ) {}

  async publishOrderEvent(
    currentUser: AuthenticatedUserEntity,
    input: PublishOrderEventInput,
  ): Promise<void> {
    try {
      await this.publishOrderEventOrThrow(currentUser, input);
    } catch (error) {
      this.logger.warnEvent(
        'System order event message could not be published.',
        {
          orderId: input.orderId,
          code: input.code,
          actorUserId: currentUser.userId,
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  name: error.name,
                }
              : String(error),
        },
        'SystemMessageService',
      );
    }
  }

  private async publishOrderEventOrThrow(
    currentUser: AuthenticatedUserEntity,
    input: PublishOrderEventInput,
  ): Promise<void> {
    const order = await this.conversationRepository.findOrderContextById(
      input.orderId,
    );

    if (order === null) {
      return;
    }

    const participants = this.messagePolicyService.buildConversationParticipants(
      currentUser,
      order,
      ConversationType.ORDER_CHAT,
    );

    if (participants === null || participants.length === 0) {
      return;
    }

    const conversation = await this.conversationRepository.resolve({
      orderId: order.orderId,
      type: ConversationType.ORDER_CHAT,
      title: this.messagePolicyService.buildConversationTitle(
        order,
        ConversationType.ORDER_CHAT,
      ),
      participants,
    });

    const body = await this.templateService.render(input.code, {
      orderCode: order.orderCode,
      merchantName: order.merchant.merchantName,
      branchName: order.branch.branchName,
      riderName: order.rider?.displayName ?? 'The rider',
      reasonCode: '',
      note: '',
      ...input.templateVariables,
    });

    const receiptUserIds = conversation.participants
      .filter((participant) => participant.leftAt === null)
      .map((participant) => participant.userId)
      .filter((userId): userId is string => userId !== null);

    const message = await this.messageRepository.createSystemEvent({
      conversationId: conversation.conversationId,
      systemEventCode: input.code,
      body,
      metadataJson: input.metadata,
      receiptUserIds,
    });

    this.messageDeliveryService.emitMessageCreated(message);
    this.messageDeliveryService.emitConversationUpdated(
      conversation.conversationId,
    );
    await this.messageDeliveryService.queuePushFallback(
      conversation.conversationId,
    );
    await this.publishSideEffects(currentUser, {
      order,
      conversation,
      message,
      code: input.code,
      metadata: input.metadata,
    });
  }

  private async publishSideEffects(
    currentUser: AuthenticatedUserEntity,
    input: {
      order: ConversationOrderContextEntity;
      conversation: ResolvedConversationEntity;
      message: SentMessageEntity;
      code: SystemMessageCode;
      metadata?: Prisma.InputJsonValue;
    },
  ): Promise<void> {
    const results = await Promise.allSettled([
      this.notificationEventService.publishOrderEvent({
        currentUser,
        order: input.order,
        conversation: input.conversation,
        message: input.message,
        code: input.code,
      }),
      this.auditEventService.publishOrderEvent({
        currentUser,
        order: input.order,
        conversation: input.conversation,
        message: input.message,
        code: input.code,
        metadataJson: input.metadata,
      }),
    ]);

    for (const result of results) {
      if (result.status === 'rejected') {
        this.logger.warnEvent(
          'System order event side effect could not be published.',
          {
            orderId: input.order.orderId,
            code: input.code,
            actorUserId: currentUser.userId,
            error:
              result.reason instanceof Error
                ? {
                    message: result.reason.message,
                    name: result.reason.name,
                  }
                : String(result.reason),
          },
          'SystemMessageService',
        );
      }
    }
  }
}
