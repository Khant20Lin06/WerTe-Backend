import {
  ConversationParticipantRole,
  ConversationType,
  UserRole,
} from '@prisma/client';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { isSystemAuthenticatedActor } from '../../auth/entities/system-authenticated-actor.helper';
import { ConversationOrderContextEntity } from '../entities/conversation-order-context.entity';
import {
  includesSystemParticipant,
  isOperationsConversationType,
  requiresAssignedRiderConversationType,
} from './conversation-lane-policy.helper';

export type ConversationParticipantSpec = {
  participantKey: string;
  userId?: string | null;
  roleAtJoin: ConversationParticipantRole;
  canSendMessages: boolean;
  canSendAttachments: boolean;
  canSendProofs: boolean;
  canModerate: boolean;
};

type ConversationResolutionInput = {
  currentUser: AuthenticatedUserEntity;
  order: ConversationOrderContextEntity;
  type: ConversationType;
};

export function canResolveConversationForOrder({
  currentUser,
  order,
  type,
}: ConversationResolutionInput): boolean {
  if (requiresAssignedRiderConversationType(type) && !hasAssignedRider(order)) {
    return false;
  }

  if (isOperationsConversationType(type)) {
    switch (type) {
      case ConversationType.CUSTOMER_OPERATIONS:
        return (
          isCustomerOwner(currentUser, order) || isOperationsActor(currentUser)
        );
      case ConversationType.MERCHANT_OPERATIONS:
        return (
          isMerchantOwner(currentUser, order) || isOperationsActor(currentUser)
        );
      case ConversationType.RIDER_OPERATIONS:
        return (
          isAssignedRider(currentUser, order) || isOperationsActor(currentUser)
        );
      default:
        return false;
    }
  }

  switch (type) {
    case ConversationType.ORDER_CHAT:
      return (
        isCustomerOwner(currentUser, order) ||
        isMerchantOwner(currentUser, order) ||
        isAssignedRider(currentUser, order) ||
        isOperationsActor(currentUser)
      );
    case ConversationType.CUSTOMER_MERCHANT:
      return (
        isCustomerOwner(currentUser, order) || isMerchantOwner(currentUser, order)
      );
    case ConversationType.CUSTOMER_RIDER:
      return (
        (isCustomerOwner(currentUser, order) || isAssignedRider(currentUser, order))
      );
    case ConversationType.MERCHANT_RIDER:
      return (
        (isMerchantOwner(currentUser, order) || isAssignedRider(currentUser, order))
      );
    default:
      return false;
  }
}

export function buildConversationParticipants({
  currentUser,
  order,
  type,
}: ConversationResolutionInput): ConversationParticipantSpec[] | null {
  const participants: ConversationParticipantSpec[] = [];

  if (requiresAssignedRiderConversationType(type) && order.rider === null) {
    return null;
  }

  switch (type) {
    case ConversationType.ORDER_CHAT:
      participants.push(
        buildUserParticipant(
          order.customer.userId,
          ConversationParticipantRole.CUSTOMER,
        ),
        buildUserParticipant(
          order.merchant.userId,
          ConversationParticipantRole.MERCHANT,
        ),
      );
      if (includesSystemParticipant(type)) {
        participants.push(buildSystemParticipant('system:order-chat'));
      }
      if (order.rider !== null) {
        participants.push(
          buildUserParticipant(
            order.rider.userId,
            ConversationParticipantRole.RIDER,
            {
              canSendProofs: true,
            },
          ),
        );
      }
      if (shouldAddOperationsParticipant(currentUser)) {
        participants.push(
          buildUserParticipant(
            currentUser.userId,
            toParticipantRole(currentUser.role),
            {
              canModerate: true,
            },
          ),
        );
      }
      break;
    case ConversationType.CUSTOMER_MERCHANT:
      participants.push(
        buildUserParticipant(
          order.customer.userId,
          ConversationParticipantRole.CUSTOMER,
        ),
        buildUserParticipant(
          order.merchant.userId,
          ConversationParticipantRole.MERCHANT,
        ),
      );
      break;
    case ConversationType.CUSTOMER_RIDER:
      if (order.rider === null) {
        return null;
      }
      participants.push(
        buildUserParticipant(
          order.customer.userId,
          ConversationParticipantRole.CUSTOMER,
        ),
        buildUserParticipant(
          order.rider.userId,
          ConversationParticipantRole.RIDER,
          {
            canSendProofs: true,
          },
        ),
      );
      break;
    case ConversationType.MERCHANT_RIDER:
      if (order.rider === null) {
        return null;
      }
      participants.push(
        buildUserParticipant(
          order.merchant.userId,
          ConversationParticipantRole.MERCHANT,
          {
            canSendProofs: true,
          },
        ),
        buildUserParticipant(
          order.rider.userId,
          ConversationParticipantRole.RIDER,
          {
            canSendProofs: true,
          },
        ),
      );
      break;
    case ConversationType.CUSTOMER_OPERATIONS:
      participants.push(
        buildUserParticipant(
          order.customer.userId,
          ConversationParticipantRole.CUSTOMER,
        ),
      );
      if (shouldAddOperationsParticipant(currentUser)) {
        participants.push(
          buildUserParticipant(
            currentUser.userId,
            toParticipantRole(currentUser.role),
            {
              canModerate: true,
            },
          ),
        );
      }
      break;
    case ConversationType.MERCHANT_OPERATIONS:
      participants.push(
        buildUserParticipant(
          order.merchant.userId,
          ConversationParticipantRole.MERCHANT,
        ),
      );
      if (shouldAddOperationsParticipant(currentUser)) {
        participants.push(
          buildUserParticipant(
            currentUser.userId,
            toParticipantRole(currentUser.role),
            {
              canModerate: true,
            },
          ),
        );
      }
      break;
    case ConversationType.RIDER_OPERATIONS:
      if (order.rider === null) {
        return null;
      }
      participants.push(
        buildUserParticipant(
          order.rider.userId,
          ConversationParticipantRole.RIDER,
          {
            canSendProofs: true,
          },
        ),
      );
      if (shouldAddOperationsParticipant(currentUser)) {
        participants.push(
          buildUserParticipant(
            currentUser.userId,
            toParticipantRole(currentUser.role),
            {
              canModerate: true,
            },
          ),
        );
      }
      break;
    default:
      return null;
  }

  return dedupeParticipants(participants);
}

export function buildConversationTitle(
  order: ConversationOrderContextEntity,
  type: ConversationType,
): string {
  return `${order.orderCode} ${type.toLowerCase()}`;
}

function isCustomerOwner(
  currentUser: AuthenticatedUserEntity,
  order: ConversationOrderContextEntity,
): boolean {
  return (
    currentUser.role === UserRole.CUSTOMER &&
    currentUser.userId === order.customer.userId &&
    currentUser.actorContext.customerProfileId === order.customer.customerProfileId
  );
}

function isMerchantOwner(
  currentUser: AuthenticatedUserEntity,
  order: ConversationOrderContextEntity,
): boolean {
  return (
    currentUser.role === UserRole.MERCHANT &&
    currentUser.userId === order.merchant.userId &&
    currentUser.actorContext.merchantId === order.merchant.merchantId
  );
}

function isAssignedRider(
  currentUser: AuthenticatedUserEntity,
  order: ConversationOrderContextEntity,
): boolean {
  return (
    order.rider !== null &&
    currentUser.role === UserRole.RIDER &&
    currentUser.userId === order.rider.userId &&
    currentUser.actorContext.riderId === order.rider.riderId
  );
}

function hasAssignedRider(order: ConversationOrderContextEntity): boolean {
  return order.rider !== null;
}

function isOperationsActor(currentUser: AuthenticatedUserEntity): boolean {
  return (
    currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPPORT
  );
}

function shouldAddOperationsParticipant(
  currentUser: AuthenticatedUserEntity,
): boolean {
  return isOperationsActor(currentUser) && !isSystemAuthenticatedActor(currentUser);
}

function toParticipantRole(role: UserRole): ConversationParticipantRole {
  switch (role) {
    case UserRole.ADMIN:
      return ConversationParticipantRole.ADMIN;
    case UserRole.SUPPORT:
      return ConversationParticipantRole.SUPPORT;
    case UserRole.CUSTOMER:
      return ConversationParticipantRole.CUSTOMER;
    case UserRole.MERCHANT:
      return ConversationParticipantRole.MERCHANT;
    case UserRole.RIDER:
      return ConversationParticipantRole.RIDER;
    default:
      return ConversationParticipantRole.SYSTEM;
  }
}

function buildUserParticipant(
  userId: string,
  roleAtJoin: ConversationParticipantRole,
  overrides?: Partial<ConversationParticipantSpec>,
): ConversationParticipantSpec {
  return {
    participantKey: `user:${userId}`,
    userId,
    roleAtJoin,
    canSendMessages: true,
    canSendAttachments: true,
    canSendProofs:
      roleAtJoin === ConversationParticipantRole.MERCHANT ||
      roleAtJoin === ConversationParticipantRole.RIDER,
    canModerate:
      roleAtJoin === ConversationParticipantRole.ADMIN ||
      roleAtJoin === ConversationParticipantRole.SUPPORT,
    ...overrides,
  };
}

function buildSystemParticipant(
  participantKey: string,
): ConversationParticipantSpec {
  return {
    participantKey,
    userId: null,
    roleAtJoin: ConversationParticipantRole.SYSTEM,
    canSendMessages: false,
    canSendAttachments: false,
    canSendProofs: false,
    canModerate: false,
  };
}

function dedupeParticipants(
  participants: ConversationParticipantSpec[],
): ConversationParticipantSpec[] {
  const entries = new Map<string, ConversationParticipantSpec>();

  for (const participant of participants) {
    entries.set(participant.participantKey, participant);
  }

  return [...entries.values()];
}
