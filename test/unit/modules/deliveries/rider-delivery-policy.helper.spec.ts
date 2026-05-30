import { DeliveryStatus, OrderStatus, UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import {
  canRiderAcceptDeliveryRequest,
  canRiderMarkDeliveryDelivered,
  canRiderMarkDeliveryFailed,
  canRiderMarkDeliveryOnTheWay,
  canRiderMarkDeliveryPickedUp,
  canRiderRejectDeliveryRequest,
} from '../../../../src/modules/deliveries/policies/rider-delivery-policy.helper';

function makeDelivery(
  overrides?: Partial<{
    riderId: string | null;
    status: DeliveryStatus;
    order: {
      status: OrderStatus;
    };
  }>,
) {
  return {
    riderId: 'rider_1',
    status: DeliveryStatus.ASSIGNED,
    order: {
      status: OrderStatus.RIDER_ASSIGNED,
    },
    ...overrides,
  };
}

describe('rider delivery policy helper', () => {
  const currentUser = makeAuthenticatedUser({
    userId: 'usr_rider_1',
    role: UserRole.RIDER,
    actorContext: {
      userId: 'usr_rider_1',
      phone: '0999999999',
      role: UserRole.RIDER,
      status: UserStatus.ACTIVE,
      riderId: 'rider_1',
    },
  });

  it('allows rider accept and reject only for assigned deliveries owned by the rider', () => {
    expect(canRiderAcceptDeliveryRequest(currentUser, makeDelivery())).toBe(true);
    expect(canRiderRejectDeliveryRequest(currentUser, makeDelivery())).toBe(true);
    expect(
      canRiderAcceptDeliveryRequest(
        currentUser,
        makeDelivery({
          riderId: 'rider_2',
        }),
      ),
    ).toBe(false);
    expect(
      canRiderRejectDeliveryRequest(
        currentUser,
        makeDelivery({
          status: DeliveryStatus.ACCEPTED,
        }),
      ),
    ).toBe(false);
  });

  it('allows pickup, on-the-way, delivered, and failed transitions only in valid states', () => {
    expect(
      canRiderMarkDeliveryPickedUp(
        currentUser,
        makeDelivery({
          status: DeliveryStatus.ACCEPTED,
          order: {
            status: OrderStatus.RIDER_ACCEPTED,
          },
        }),
      ),
    ).toBe(true);
    expect(
      canRiderMarkDeliveryOnTheWay(
        currentUser,
        makeDelivery({
          status: DeliveryStatus.PICKED_UP,
          order: {
            status: OrderStatus.PICKED_UP,
          },
        }),
      ),
    ).toBe(true);
    expect(
      canRiderMarkDeliveryDelivered(
        currentUser,
        makeDelivery({
          status: DeliveryStatus.ON_THE_WAY,
          order: {
            status: OrderStatus.ON_THE_WAY,
          },
        }),
      ),
    ).toBe(true);
    expect(
      canRiderMarkDeliveryFailed(
        currentUser,
        makeDelivery({
          status: DeliveryStatus.PICKED_UP,
          order: {
            status: OrderStatus.PICKED_UP,
          },
        }),
      ),
    ).toBe(true);
    expect(
      canRiderMarkDeliveryFailed(
        currentUser,
        makeDelivery({
          status: DeliveryStatus.ACCEPTED,
          order: {
            status: OrderStatus.RIDER_ACCEPTED,
          },
        }),
      ),
    ).toBe(false);
  });
});
