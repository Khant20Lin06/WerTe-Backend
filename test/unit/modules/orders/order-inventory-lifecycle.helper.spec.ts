import { OrderStatus } from '@prisma/client';

import { shouldReleaseInventoryForOrderTransition } from '../../../../src/modules/orders/policies/order-inventory-lifecycle.helper';

describe('order-inventory-lifecycle.helper', () => {
  it('releases inventory for early cancellations', () => {
    expect(
      shouldReleaseInventoryForOrderTransition(
        OrderStatus.PLACED,
        OrderStatus.CANCELLED,
      ),
    ).toBe(true);
    expect(
      shouldReleaseInventoryForOrderTransition(
        OrderStatus.MERCHANT_ACCEPTED,
        OrderStatus.CANCELLED,
      ),
    ).toBe(true);
  });

  it('releases inventory for merchant rejection before preparation', () => {
    expect(
      shouldReleaseInventoryForOrderTransition(
        OrderStatus.PLACED,
        OrderStatus.MERCHANT_REJECTED,
      ),
    ).toBe(true);
  });

  it('does not release inventory for late or non-terminal transitions', () => {
    expect(
      shouldReleaseInventoryForOrderTransition(
        OrderStatus.PREPARING,
        OrderStatus.CANCELLED,
      ),
    ).toBe(false);
    expect(
      shouldReleaseInventoryForOrderTransition(
        OrderStatus.PICKED_UP,
        OrderStatus.CANCELLED,
      ),
    ).toBe(false);
    expect(
      shouldReleaseInventoryForOrderTransition(
        OrderStatus.MERCHANT_ACCEPTED,
        OrderStatus.PREPARING,
      ),
    ).toBe(false);
  });
});
