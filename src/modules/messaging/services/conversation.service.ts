import { HttpStatus, Injectable } from '@nestjs/common';
import { ConversationType } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import {
  supportsAssignedRiderConversation,
} from '../entities/conversation-order-context.entity';
import { ResolvedConversationEntity } from '../entities/resolved-conversation.entity';
import {
  CreateConversationDto,
  ConversationTypeValue,
} from '../dto/create-conversation.dto';
import { MessagePolicyService } from '../policies/message-policy.service';
import { ConversationRepository } from '../repositories/conversation.repository';

const conversationTypeMap: Record<ConversationTypeValue, ConversationType> = {
  [ConversationTypeValue.orderChat]: ConversationType.ORDER_CHAT,
  [ConversationTypeValue.customerMerchant]: ConversationType.CUSTOMER_MERCHANT,
  [ConversationTypeValue.customerRider]: ConversationType.CUSTOMER_RIDER,
  [ConversationTypeValue.merchantRider]: ConversationType.MERCHANT_RIDER,
  [ConversationTypeValue.customerOperations]:
    ConversationType.CUSTOMER_OPERATIONS,
  [ConversationTypeValue.merchantOperations]:
    ConversationType.MERCHANT_OPERATIONS,
  [ConversationTypeValue.riderOperations]: ConversationType.RIDER_OPERATIONS,
};

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messagePolicyService: MessagePolicyService,
  ) {}

  async resolve(
    currentUser: AuthenticatedUserEntity,
    dto: CreateConversationDto,
  ): Promise<ResolvedConversationEntity> {
    const type = conversationTypeMap[dto.type];
    const order = await this.conversationRepository.findOrderContextById(
      dto.orderId,
    );

    if (order === null) {
      throw new AppException('Order was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (
      supportsAssignedRiderConversation(type) &&
      order.rider === null &&
      type !== ConversationType.ORDER_CHAT
    ) {
      throw new AppException(
        'This conversation lane is not available until a rider is assigned.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }

    if (
      !this.messagePolicyService.canResolveConversation(currentUser, order, type)
    ) {
      throw new AppException(
        'You are not allowed to resolve this conversation lane.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    const participants = this.messagePolicyService.buildConversationParticipants(
      currentUser,
      order,
      type,
    );

    if (participants === null || participants.length === 0) {
      throw new AppException(
        'The conversation lane could not be resolved for this order.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }

    return this.conversationRepository.resolve({
      orderId: order.orderId,
      type,
      title: this.messagePolicyService.buildConversationTitle(order, type),
      participants,
    });
  }
}
