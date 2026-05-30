import {
  MessageAttachmentType,
  MessageAttachmentVisibility,
  MessageType,
} from '@prisma/client';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuditEventService } from '../../audit/services/audit-event.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
import { SentMessageEntity } from '../entities/sent-message.entity';
import {
  SendMessageAttachmentDto,
  SendMessageAttachmentTypeValue,
} from '../dto/send-message-attachment.dto';
import { SendMessageDto, SendMessageTypeValue } from '../dto/send-message.dto';
import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository } from '../repositories/message.repository';
import { MessageDeliveryService } from './message-delivery.service';
import { MessagingPolicyService } from './message-policy.service';

const messageTypeMap: Record<SendMessageTypeValue, MessageType> = {
  [SendMessageTypeValue.text]: MessageType.TEXT,
  [SendMessageTypeValue.image]: MessageType.IMAGE,
  [SendMessageTypeValue.file]: MessageType.FILE,
  [SendMessageTypeValue.proofOfHandoff]: MessageType.PROOF_OF_HANDOFF,
  [SendMessageTypeValue.proofOfDelivery]: MessageType.PROOF_OF_DELIVERY,
};

const attachmentTypeMap: Record<
  SendMessageAttachmentTypeValue,
  MessageAttachmentType
> = {
  [SendMessageAttachmentTypeValue.image]: MessageAttachmentType.IMAGE,
  [SendMessageAttachmentTypeValue.file]: MessageAttachmentType.FILE,
  [SendMessageAttachmentTypeValue.proofOfHandoff]:
    MessageAttachmentType.PROOF_OF_HANDOFF,
  [SendMessageAttachmentTypeValue.proofOfDelivery]:
    MessageAttachmentType.PROOF_OF_DELIVERY,
};

@Injectable()
export class MessageService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly messagingPolicyService: MessagingPolicyService,
    private readonly messageDeliveryService: MessageDeliveryService,
    private readonly notificationEventService: NotificationEventService,
    private readonly auditEventService: AuditEventService,
  ) {}

  async send(
    currentUser: AuthenticatedUserEntity,
    dto: SendMessageDto,
  ): Promise<SentMessageEntity> {
    const conversation = await this.conversationRepository.findResolvedById(
      dto.conversationId,
    );

    if (conversation === null) {
      throw new AppException('Conversation was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (
      !this.messagingPolicyService.canAccessConversation(
        currentUser,
        conversation,
      )
    ) {
      throw new AppException(
        'You are not allowed to access this conversation.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    const messageType = this.resolveMessageType(dto);

    if (
      !this.messagingPolicyService.canSendMessage(
        currentUser,
        conversation,
        messageType,
      )
    ) {
      throw new AppException(
        'You are not allowed to send this message type in the conversation.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    const attachments = this.mapAttachments(dto.attachments ?? []);
    this.assertValidPayload(messageType, dto.body, attachments);

    for (const attachment of attachments) {
      if (
        !this.messagingPolicyService.canSendAttachment(
          currentUser,
          conversation,
          attachment.type,
        )
      ) {
        throw new AppException(
          'You are not allowed to send this attachment type in the conversation.',
          HttpStatus.FORBIDDEN,
          {
            code: ErrorCodes.forbidden,
          },
        );
      }
    }

    const receiptUserIds = conversation.participants
      .filter((participant) => participant.leftAt === null)
      .map((participant) => participant.userId)
      .filter((userId): userId is string => userId !== null);

    const message = await this.messageRepository.create({
      conversationId: conversation.conversationId,
      senderKind: 'USER',
      senderId: currentUser.userId,
      type: messageType,
      body: dto.body?.trim() ?? '',
      attachments: attachments.map((attachment) => ({
        ...attachment,
        visibility: this.resolveAttachmentVisibility(attachment.type),
      })),
      receiptUserIds,
    });

    this.messageDeliveryService.emitMessageCreated(message);
    this.messageDeliveryService.emitConversationUpdated(
      conversation.conversationId,
    );
    await this.messageDeliveryService.queuePushFallback(
      conversation.conversationId,
    );
    const order = await this.conversationRepository.findOrderContextById(
      conversation.orderId,
    );
    await Promise.allSettled([
      this.notificationEventService.publishConversationMessage({
        currentUser,
        order,
        conversation,
        message,
      }),
      this.auditEventService.publishConversationMessage({
        currentUser,
        order,
        conversation,
        message,
      }),
    ]);

    return message;
  }

  private resolveMessageType(dto: SendMessageDto): MessageType {
    return dto.type === undefined ? MessageType.TEXT : messageTypeMap[dto.type];
  }

  private mapAttachments(
    attachments: SendMessageAttachmentDto[],
  ): Array<{
    type: MessageAttachmentType;
    storageKey: string;
    fileName?: string;
    mimeType?: string;
    fileSizeBytes?: number;
    width?: number;
    height?: number;
  }> {
    return attachments.map((attachment) => ({
      type: attachmentTypeMap[attachment.type],
      storageKey: attachment.storageKey,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      fileSizeBytes: attachment.fileSizeBytes,
      width: attachment.width,
      height: attachment.height,
    }));
  }

  private assertValidPayload(
    messageType: MessageType,
    body: string | undefined,
    attachments: Array<{ type: MessageAttachmentType }>,
  ): void {
    const trimmedBody = body?.trim() ?? '';

    if (messageType === MessageType.TEXT) {
      if (trimmedBody.length === 0) {
        throw new AppException(
          'Text messages require a non-empty body.',
          HttpStatus.UNPROCESSABLE_ENTITY,
          {
            code: ErrorCodes.unprocessableEntity,
          },
        );
      }

      if (attachments.length > 0) {
        throw new AppException(
          'Text messages cannot include attachments.',
          HttpStatus.UNPROCESSABLE_ENTITY,
          {
            code: ErrorCodes.unprocessableEntity,
          },
        );
      }

      return;
    }

    if (attachments.length === 0) {
      throw new AppException(
        'This message type requires at least one attachment.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }

    const expectedAttachmentType =
      this.resolveExpectedAttachmentType(messageType);

    if (
      !attachments.every(
        (attachment) => attachment.type === expectedAttachmentType,
      )
    ) {
      throw new AppException(
        'Attachment type does not match the selected message type.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }
  }

  private resolveExpectedAttachmentType(
    messageType: MessageType,
  ): MessageAttachmentType {
    switch (messageType) {
      case MessageType.IMAGE:
        return MessageAttachmentType.IMAGE;
      case MessageType.FILE:
        return MessageAttachmentType.FILE;
      case MessageType.PROOF_OF_HANDOFF:
        return MessageAttachmentType.PROOF_OF_HANDOFF;
      case MessageType.PROOF_OF_DELIVERY:
        return MessageAttachmentType.PROOF_OF_DELIVERY;
      default:
        return MessageAttachmentType.FILE;
    }
  }

  private resolveAttachmentVisibility(
    attachmentType: MessageAttachmentType,
  ): MessageAttachmentVisibility {
    switch (attachmentType) {
      case MessageAttachmentType.PROOF_OF_HANDOFF:
        return MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN;
      case MessageAttachmentType.PROOF_OF_DELIVERY:
        return MessageAttachmentVisibility.RIDER_CUSTOMER_ADMIN;
      default:
        return MessageAttachmentVisibility.ALL_PARTICIPANTS;
    }
  }
}
