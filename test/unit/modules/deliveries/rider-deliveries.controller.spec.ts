import { DeliveryStatus, OrderStatus, RiderStatus, UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { RiderDeliveriesController } from '../../../../src/modules/deliveries/controllers/rider-deliveries.controller';
import { DeliveryQueryService } from '../../../../src/modules/deliveries/services/delivery-query.service';
import { RiderDeliveryActionsService } from '../../../../src/modules/deliveries/services/rider-delivery-actions.service';

function makeDeliveryDetail(status: DeliveryStatus = DeliveryStatus.ASSIGNED) {
  return {
    deliveryId: 'delivery_1',
    orderId: 'order_1',
    riderId: 'rider_1',
    status,
    etaMinutes: 18,
    assignedAt: '2026-04-19T10:10:00.000Z',
    acceptedAt: status === DeliveryStatus.ACCEPTED ? '2026-04-19T10:12:00.000Z' : null,
    pickedUpAt: null,
    onTheWayAt: null,
    deliveredAt: null,
    failedAt: null,
    cancelledAt: null,
    failureReasonCode: null,
    failureNote: null,
    createdAt: '2026-04-19T10:10:00.000Z',
    updatedAt: '2026-04-19T10:10:00.000Z',
    order: {
      orderId: 'order_1',
      orderCode: 'ORD-00000001',
      orderStatus:
        status === DeliveryStatus.ACCEPTED
          ? OrderStatus.RIDER_ACCEPTED
          : OrderStatus.RIDER_ASSIGNED,
      currencyCode: 'MMK',
      subtotalAmount: '6500',
      discountAmount: '0',
      deliveryFee: '500',
      totalAmount: '7000',
      placedAt: '2026-04-19T10:00:00.000Z',
      updatedAt: '2026-04-19T10:10:00.000Z',
      customer: {
        customerProfileId: 'cust_prof_1',
        userId: 'usr_customer_1',
        phone: '09123456789',
        userStatus: UserStatus.ACTIVE,
        fullName: 'Mg Mg',
      },
      branch: {
        branchId: 'branch_1',
        branchName: 'Downtown Branch',
        branchStatus: 'ACTIVE',
        township: 'Botahtaung',
        merchantId: 'merchant_1',
        merchantUserId: 'usr_merchant_1',
        merchantName: 'Merchant One',
        merchantStatus: 'ACTIVE',
      },
      deliveryAddress: {
        label: 'Home',
        line1: 'No. 1, Main Road',
        line2: null,
        landmark: null,
        township: 'Botahtaung',
        city: 'Yangon',
        postalCode: null,
        deliveryInstructions: null,
        latitude: '16.834',
        longitude: '96.176',
      },
    },
    rider: {
      riderId: 'rider_1',
      userId: 'usr_rider_1',
      phone: '0999999999',
      userStatus: UserStatus.ACTIVE,
      displayName: 'Ko Aung',
      vehicleType: 'bike',
      currentTownship: 'Pabedan',
      status: RiderStatus.ACTIVE,
      availability: null,
      currentLocation: null,
    },
  };
}

describe('RiderDeliveriesController', () => {
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

  it('delegates active and detail delivery reads to the delivery query service', async () => {
    const deliveryQueryService = {
      getRiderActiveDelivery: jest.fn().mockResolvedValue(makeDeliveryDetail()),
      getRiderDeliveryDetail: jest.fn().mockResolvedValue(makeDeliveryDetail()),
    } as unknown as jest.Mocked<DeliveryQueryService>;
    const riderDeliveryActionsService = {} as jest.Mocked<RiderDeliveryActionsService>;
    const controller = new RiderDeliveriesController(
      deliveryQueryService,
      riderDeliveryActionsService,
    );

    const active = await controller.active(currentUser);
    const detail = await controller.detail(currentUser, 'delivery_1');

    expect(deliveryQueryService.getRiderActiveDelivery).toHaveBeenCalledWith(
      currentUser,
    );
    expect(deliveryQueryService.getRiderDeliveryDetail).toHaveBeenCalledWith(
      currentUser,
      'delivery_1',
    );
    expect(active).toMatchObject({ deliveryId: 'delivery_1' });
    expect(detail).toMatchObject({ deliveryId: 'delivery_1' });
  });

  it('delegates rider request accept and reject actions to the action service', async () => {
    const deliveryQueryService = {} as jest.Mocked<DeliveryQueryService>;
    const riderDeliveryActionsService = {
      acceptCurrentRiderDeliveryRequest: jest
        .fn()
        .mockResolvedValue(makeDeliveryDetail(DeliveryStatus.ACCEPTED)),
      rejectCurrentRiderDeliveryRequest: jest
        .fn()
        .mockResolvedValue(makeDeliveryDetail(DeliveryStatus.PENDING_ASSIGNMENT)),
    } as unknown as jest.Mocked<RiderDeliveryActionsService>;
    const controller = new RiderDeliveriesController(
      deliveryQueryService,
      riderDeliveryActionsService,
    );

    const accepted = await controller.accept(currentUser, 'delivery_1');
    const rejected = await controller.reject(currentUser, 'delivery_1', {
      reasonCode: 'rider_rejected_assignment',
      note: 'Too far away.',
    });

    expect(
      riderDeliveryActionsService.acceptCurrentRiderDeliveryRequest,
    ).toHaveBeenCalledWith(currentUser, {
      deliveryId: 'delivery_1',
    });
    expect(
      riderDeliveryActionsService.rejectCurrentRiderDeliveryRequest,
    ).toHaveBeenCalledWith(currentUser, {
      deliveryId: 'delivery_1',
      reasonCode: 'rider_rejected_assignment',
      note: 'Too far away.',
    });
    expect(accepted).toMatchObject({ status: DeliveryStatus.ACCEPTED });
    expect(rejected).toMatchObject({ status: DeliveryStatus.PENDING_ASSIGNMENT });
  });

  it('delegates fulfillment progression actions to the action service', async () => {
    const deliveryQueryService = {} as jest.Mocked<DeliveryQueryService>;
    const riderDeliveryActionsService = {
      markCurrentRiderPickedUp: jest
        .fn()
        .mockResolvedValue(makeDeliveryDetail(DeliveryStatus.PICKED_UP)),
      markCurrentRiderOnTheWay: jest
        .fn()
        .mockResolvedValue(makeDeliveryDetail(DeliveryStatus.ON_THE_WAY)),
      markCurrentRiderDelivered: jest
        .fn()
        .mockResolvedValue(makeDeliveryDetail(DeliveryStatus.DELIVERED)),
      failCurrentRiderDelivery: jest
        .fn()
        .mockResolvedValue(makeDeliveryDetail(DeliveryStatus.FAILED)),
    } as unknown as jest.Mocked<RiderDeliveryActionsService>;
    const controller = new RiderDeliveriesController(
      deliveryQueryService,
      riderDeliveryActionsService,
    );

    await controller.markPickedUp(currentUser, 'delivery_1');
    await controller.markOnTheWay(currentUser, 'delivery_1');
    await controller.markDelivered(currentUser, 'delivery_1');
    const failed = await controller.markFailed(currentUser, 'delivery_1', {
      reasonCode: 'customer_unreachable',
      note: 'Phone unreachable',
    });

    expect(riderDeliveryActionsService.markCurrentRiderPickedUp).toHaveBeenCalledWith(
      currentUser,
      {
        deliveryId: 'delivery_1',
      },
    );
    expect(riderDeliveryActionsService.markCurrentRiderOnTheWay).toHaveBeenCalledWith(
      currentUser,
      {
        deliveryId: 'delivery_1',
      },
    );
    expect(riderDeliveryActionsService.markCurrentRiderDelivered).toHaveBeenCalledWith(
      currentUser,
      {
        deliveryId: 'delivery_1',
      },
    );
    expect(riderDeliveryActionsService.failCurrentRiderDelivery).toHaveBeenCalledWith(
      currentUser,
      {
        deliveryId: 'delivery_1',
        reasonCode: 'customer_unreachable',
        note: 'Phone unreachable',
      },
    );
    expect(failed).toMatchObject({ status: DeliveryStatus.FAILED });
  });
});
