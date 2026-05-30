import {
  AuditActionSource,
  AuditActorType,
  AuditResourceType,
  SystemMessageCode,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { isSystemAuthenticatedActor } from '../../auth/entities/system-authenticated-actor.helper';
import { ConversationOrderContextEntity } from '../../messaging/entities/conversation-order-context.entity';
import { ResolvedConversationEntity } from '../../messaging/entities/resolved-conversation.entity';
import { SentMessageEntity } from '../../messaging/entities/sent-message.entity';
import { AuditService } from './audit.service';

@Injectable()
export class AuditEventService {
  constructor(private readonly auditService: AuditService) {}

  async publishOrderEvent(input: {
    currentUser: AuthenticatedUserEntity;
    order: ConversationOrderContextEntity;
    conversation: ResolvedConversationEntity;
    message: SentMessageEntity;
    code: SystemMessageCode;
    metadataJson?: unknown;
  }): Promise<void> {
    const resource = this.resolveOrderEventResource(
      input.code,
      input.order.orderId,
      input.metadataJson,
    );

    const isSystemActor = isSystemAuthenticatedActor(input.currentUser);

    await this.auditService.logAction({
      actorType: isSystemActor ? AuditActorType.SYSTEM : AuditActorType.USER,
      actorUserId: isSystemActor ? null : input.currentUser.userId,
      actorRole: isSystemActor ? null : input.currentUser.role,
      actionSource: isSystemActor
        ? AuditActionSource.SYSTEM
        : AuditActionSource.API,
      action: this.mapSystemMessageCodeToAuditAction(input.code),
      resourceType: resource.resourceType,
      resourceId: resource.resourceId,
      resourceLabel: input.order.orderCode,
      orderId: input.order.orderId,
      conversationId: input.conversation.conversationId,
      messageId: input.message.messageId,
      metadataJson: {
        systemMessageCode: input.code,
        ...(isSystemActor
          ? { systemActorId: input.currentUser.userId }
          : {}),
        ...(this.normalizeMetadata(input.metadataJson) ?? {}),
      },
    });
  }

  async publishConversationMessage(input: {
    currentUser: AuthenticatedUserEntity;
    order: ConversationOrderContextEntity | null;
    conversation: ResolvedConversationEntity;
    message: SentMessageEntity;
  }): Promise<void> {
    await this.auditService.logAction({
      actorUserId: input.currentUser.userId,
      actorRole: input.currentUser.role,
      actionSource: AuditActionSource.API,
      action: 'messaging.message_sent',
      resourceType: AuditResourceType.MESSAGE,
      resourceId: input.message.messageId,
      resourceLabel: input.conversation.title ?? input.conversation.conversationId,
      orderId: input.order?.orderId ?? null,
      conversationId: input.conversation.conversationId,
      messageId: input.message.messageId,
      metadataJson: {
        messageType: input.message.type,
        attachmentCount: input.message.attachments.length,
      },
    });
  }

  private mapSystemMessageCodeToAuditAction(code: SystemMessageCode): string {
    switch (code) {
      case SystemMessageCode.ORDER_PLACED:
        return 'orders.placed';
      case SystemMessageCode.ORDER_ACCEPTED:
        return 'orders.accepted';
      case SystemMessageCode.ORDER_REJECTED:
        return 'orders.rejected';
      case SystemMessageCode.ORDER_PREPARING:
        return 'orders.preparing';
      case SystemMessageCode.RIDER_ASSIGNED:
        return 'dispatch.rider_assigned';
      case SystemMessageCode.RIDER_ACCEPTED:
        return 'deliveries.rider_accepted';
      case SystemMessageCode.RIDER_REJECTED_ASSIGNMENT:
        return 'deliveries.rider_rejected_assignment';
      case SystemMessageCode.ORDER_PICKED_UP:
        return 'deliveries.picked_up';
      case SystemMessageCode.ORDER_ON_THE_WAY:
        return 'deliveries.on_the_way';
      case SystemMessageCode.ORDER_DELIVERED:
        return 'deliveries.delivered';
      case SystemMessageCode.ORDER_CANCELLED:
        return 'orders.cancelled';
      case SystemMessageCode.FAILED_DELIVERY:
        return 'deliveries.failed';
      case SystemMessageCode.MERCHANT_HANDOFF_CONFIRMED:
        return 'deliveries.merchant_handoff_confirmed';
      case SystemMessageCode.DELIVERY_PROOF_SUBMITTED:
        return 'deliveries.proof_submitted';
      case SystemMessageCode.ADMIN_INTERVENTION:
        return 'orders.admin_intervention';
      case SystemMessageCode.PAYMENT_PENDING:
        return 'payments.pending';
      case SystemMessageCode.PAYMENT_SUCCEEDED:
        return 'payments.succeeded';
      case SystemMessageCode.PAYMENT_FAILED:
        return 'payments.failed';
      case SystemMessageCode.PAYMENT_CANCELLED:
        return 'payments.cancelled';
      case SystemMessageCode.REFUND_REQUESTED:
        return 'refunds.requested';
      case SystemMessageCode.REFUND_SUCCEEDED:
        return 'refunds.succeeded';
      case SystemMessageCode.REFUND_FAILED:
        return 'refunds.failed';
      default:
        return 'orders.system_event';
    }
  }

  private resolveOrderEventResource(
    code: SystemMessageCode,
    orderId: string,
    metadata: unknown,
  ): {
    resourceType: AuditResourceType;
    resourceId: string;
  } {
    const metadataRecord = this.normalizeMetadata(metadata);

    switch (code) {
      case SystemMessageCode.PAYMENT_PENDING:
      case SystemMessageCode.PAYMENT_SUCCEEDED:
      case SystemMessageCode.PAYMENT_FAILED:
      case SystemMessageCode.PAYMENT_CANCELLED:
        return {
          resourceType: AuditResourceType.PAYMENT,
          resourceId: this.readMetadataString(metadataRecord, 'paymentId') ?? orderId,
        };
      case SystemMessageCode.REFUND_REQUESTED:
      case SystemMessageCode.REFUND_SUCCEEDED:
      case SystemMessageCode.REFUND_FAILED:
        return {
          resourceType: AuditResourceType.REFUND,
          resourceId: this.readMetadataString(metadataRecord, 'refundId') ?? orderId,
        };
      case SystemMessageCode.RIDER_ASSIGNED:
      case SystemMessageCode.RIDER_ACCEPTED:
      case SystemMessageCode.RIDER_REJECTED_ASSIGNMENT:
      case SystemMessageCode.ORDER_PICKED_UP:
      case SystemMessageCode.ORDER_ON_THE_WAY:
      case SystemMessageCode.ORDER_DELIVERED:
      case SystemMessageCode.FAILED_DELIVERY:
      case SystemMessageCode.MERCHANT_HANDOFF_CONFIRMED:
      case SystemMessageCode.DELIVERY_PROOF_SUBMITTED:
        return {
          resourceType: AuditResourceType.DELIVERY,
          resourceId: orderId,
        };
      default:
        return {
          resourceType: AuditResourceType.ORDER,
          resourceId: orderId,
        };
    }
  }

  private normalizeMetadata(metadata: unknown): Record<string, unknown> | null {
    if (metadata == null || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return null;
    }

    return metadata as Record<string, unknown>;
  }

  private readMetadataString(
    metadata: Record<string, unknown> | null,
    key: string,
  ): string | null {
    if (metadata === null) {
      return null;
    }

    const value = metadata[key];

    return typeof value === 'string' && value.length > 0 ? value : null;
  }
}
