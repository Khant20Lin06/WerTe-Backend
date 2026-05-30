import { OrderStatus } from '@prisma/client';

const INVENTORY_RELEASE_TO_STATUSES = new Set<OrderStatus>([
  OrderStatus.CANCELLED,
  OrderStatus.MERCHANT_REJECTED,
]);

const INVENTORY_RELEASABLE_FROM_STATUSES = new Set<OrderStatus>([
  OrderStatus.PLACED,
  OrderStatus.MERCHANT_ACCEPTED,
]);

export function shouldReleaseInventoryForOrderTransition(
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
): boolean {
  if (fromStatus === toStatus) {
    return false;
  }

  return (
    INVENTORY_RELEASE_TO_STATUSES.has(toStatus) &&
    INVENTORY_RELEASABLE_FROM_STATUSES.has(fromStatus)
  );
}
