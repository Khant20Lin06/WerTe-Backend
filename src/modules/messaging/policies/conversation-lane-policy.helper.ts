import { ConversationType } from '@prisma/client';

export function requiresAssignedRiderConversationType(
  type: ConversationType,
): boolean {
  return (
    type === ConversationType.ORDER_CHAT ||
    type === ConversationType.CUSTOMER_RIDER ||
    type === ConversationType.MERCHANT_RIDER ||
    type === ConversationType.RIDER_OPERATIONS
  );
}

export function isOperationsConversationType(type: ConversationType): boolean {
  return (
    type === ConversationType.CUSTOMER_OPERATIONS ||
    type === ConversationType.MERCHANT_OPERATIONS ||
    type === ConversationType.RIDER_OPERATIONS
  );
}

export function includesSystemParticipant(type: ConversationType): boolean {
  return type === ConversationType.ORDER_CHAT;
}
