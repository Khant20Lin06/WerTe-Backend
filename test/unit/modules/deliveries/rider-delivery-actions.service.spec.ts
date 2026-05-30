import { HttpStatus } from '@nestjs/common';
import { DeliveryStatus, OrderStatus, UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { DeliveryDetailRecord } from '../../../../src/modules/deliveries/entities/delivery-detail.entity';
import { DeliveriesRepository } from '../../../../src/modules/deliveries/repositories/deliveries.repository';
import { DeliveryQueryService } from '../../../../src/modules/deliveries/services/delivery-query.service';
import { RiderDeliveryActionsService } from '../../../../src/modules/deliveries/services/rider-delivery-actions.service';
import { SystemMessageService } from '../../../../src/modules/messaging/services/system-message.service';
import { OrdersRepository } from '../../../../src/modules/orders/repositories/orders.repository';

function makeDeliveryRecord(
  overrides?: Record<string, unknown>,
): DeliveryDetailRecord {
  return {
    id: 'delivery_1',
    orderId: 'order_1',
    riderId: 'rider_1',
    status: DeliveryStatus.ASSIGNED,
    etaMinutes: 18,
    assignedAt: new Date('2026-04-19T10:10:00.000Z'),
    acceptedAt: null,
    pickedUpAt: null,
    onTheWayAt: null,
    deliveredAt: null,
    failedAt: null,
    cancelledAt: null,
    failureReasonCode: null,
    failureNote: null,
    createdAt: new Date('2026-04-19T10:10:00.000Z'),
    updatedAt: new Date('2026-04-19T10:10:00.000Z'),
    order: {
      status: OrderStatus.RIDER_ASSIGNED,
    },
    rider: null,
    ...overrides,
  } as unknown as DeliveryDetailRecord;
}

function makeDeliveryDetail(
  overrides?: Record<string, unknown>,
) {
  return {
    deliveryId: 'delivery_1',
    orderId: 'order_1',
    riderId: 'rider_1',
    status: DeliveryStatus.ASSIGNED,
    order: {
      orderId: 'order_1',
      orderStatus: OrderStatus.RIDER_ASSIGNED,
    },
    ...overrides,
  };
}

describe('RiderDeliveryActionsService', () => {
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

  const makeService = () => {
    const prisma = {
      runInTransaction: jest
        .fn()
        .mockImplementation(async (operation) => operation({})),
    } as unknown as jest.Mocked<PrismaService>;
    const deliveriesRepository = {
      findRiderDeliveryById: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
    } as unknown as jest.Mocked<DeliveriesRepository>;
    const ordersRepository = {
      updateOrderStatus: jest.fn(),
    } as unknown as jest.Mocked<OrdersRepository>;
    const deliveryQueryService = {
      buildDeliveryDetail: jest.fn(),
    } as unknown as jest.Mocked<DeliveryQueryService>;
    const systemMessageService = {
      publishOrderEvent: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SystemMessageService>;
    const service = new RiderDeliveryActionsService(
      prisma,
      deliveriesRepository,
      ordersRepository,
      deliveryQueryService,
      systemMessageService,
    );

    return {
      prisma,
      deliveriesRepository,
      ordersRepository,
      deliveryQueryService,
      systemMessageService,
      service,
    };
  };

  it('accepts an assigned delivery request and transitions the order to rider_accepted', async () => {
    const {
      prisma,
      deliveriesRepository,
      ordersRepository,
      deliveryQueryService,
      systemMessageService,
      service,
    } = makeService();
    deliveriesRepository.findRiderDeliveryById
      .mockResolvedValueOnce(
        makeDeliveryRecord({
          status: DeliveryStatus.ASSIGNED,
          order: {
            status: OrderStatus.RIDER_ASSIGNED,
          },
        }),
      )
      .mockResolvedValueOnce(
        makeDeliveryRecord({
          status: DeliveryStatus.ACCEPTED,
          order: {
            status: OrderStatus.RIDER_ACCEPTED,
          },
          acceptedAt: new Date('2026-04-19T10:12:00.000Z'),
        }),
      );
    deliveriesRepository.updateById.mockResolvedValue({} as never);
    ordersRepository.updateOrderStatus.mockResolvedValue({} as never);
    deliveryQueryService.buildDeliveryDetail.mockReturnValue(
      makeDeliveryDetail({
        status: DeliveryStatus.ACCEPTED,
        order: {
          orderId: 'order_1',
          orderStatus: OrderStatus.RIDER_ACCEPTED,
        },
      }) as never,
    );

    const result = await service.acceptCurrentRiderDeliveryRequest(currentUser, {
      deliveryId: 'delivery_1',
    });

    expect(prisma.runInTransaction).toHaveBeenCalled();
    expect(deliveriesRepository.updateById).toHaveBeenCalledWith(
      'delivery_1',
      expect.objectContaining({
        status: DeliveryStatus.ACCEPTED,
      }),
      {},
    );
    expect(ordersRepository.updateOrderStatus).toHaveBeenCalledWith(
      'order_1',
      expect.objectContaining({
        status: OrderStatus.RIDER_ACCEPTED,
        fromStatus: OrderStatus.RIDER_ASSIGNED,
        changedByUserId: 'usr_rider_1',
        reasonCode: 'rider_accepted_assignment',
      }),
      {},
    );
    expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(
      currentUser,
      expect.objectContaining({
        orderId: 'order_1',
        code: 'RIDER_ACCEPTED',
      }),
    );
    expect(result).toMatchObject({
      status: DeliveryStatus.ACCEPTED,
    });
  });

  it('rejects an assigned delivery request and requeues the order for dispatch', async () => {
    const {
      deliveriesRepository,
      ordersRepository,
      deliveryQueryService,
      service,
    } = makeService();
    deliveriesRepository.findRiderDeliveryById.mockResolvedValueOnce(
      makeDeliveryRecord({
        status: DeliveryStatus.ASSIGNED,
        order: {
          status: OrderStatus.RIDER_ASSIGNED,
        },
      }),
    );
    deliveriesRepository.updateById.mockResolvedValue({} as never);
    ordersRepository.updateOrderStatus.mockResolvedValue({} as never);
    deliveriesRepository.findById.mockResolvedValue(
      makeDeliveryRecord({
        riderId: null,
        status: DeliveryStatus.PENDING_ASSIGNMENT,
        etaMinutes: null,
        order: {
          status: OrderStatus.PREPARING,
        },
      }),
    );
    deliveryQueryService.buildDeliveryDetail.mockReturnValue(
      makeDeliveryDetail({
        riderId: null,
        status: DeliveryStatus.PENDING_ASSIGNMENT,
        order: {
          orderId: 'order_1',
          orderStatus: OrderStatus.PREPARING,
        },
      }) as never,
    );

    const result = await service.rejectCurrentRiderDeliveryRequest(currentUser, {
      deliveryId: 'delivery_1',
      reasonCode: 'rider_rejected_assignment',
      note: 'Too far away.',
    });

    expect(deliveriesRepository.updateById).toHaveBeenCalledWith(
      'delivery_1',
      expect.objectContaining({
        riderId: null,
        status: DeliveryStatus.PENDING_ASSIGNMENT,
        etaMinutes: null,
      }),
      {},
    );
    expect(ordersRepository.updateOrderStatus).toHaveBeenCalledWith(
      'order_1',
      expect.objectContaining({
        status: OrderStatus.PREPARING,
        reasonCode: 'rider_rejected_assignment',
        note: 'Too far away.',
      }),
      {},
    );
    expect(result).toMatchObject({
      status: DeliveryStatus.PENDING_ASSIGNMENT,
      riderId: null,
    });
  });

  it('marks a picked up delivery as on the way', async () => {
    const {
      deliveriesRepository,
      ordersRepository,
      deliveryQueryService,
      service,
    } = makeService();
    deliveriesRepository.findRiderDeliveryById
      .mockResolvedValueOnce(
        makeDeliveryRecord({
          status: DeliveryStatus.PICKED_UP,
          order: {
            status: OrderStatus.PICKED_UP,
          },
        }),
      )
      .mockResolvedValueOnce(
        makeDeliveryRecord({
          status: DeliveryStatus.ON_THE_WAY,
          order: {
            status: OrderStatus.ON_THE_WAY,
          },
        }),
      );
    deliveriesRepository.updateById.mockResolvedValue({} as never);
    ordersRepository.updateOrderStatus.mockResolvedValue({} as never);
    deliveryQueryService.buildDeliveryDetail.mockReturnValue(
      makeDeliveryDetail({
        status: DeliveryStatus.ON_THE_WAY,
        order: {
          orderId: 'order_1',
          orderStatus: OrderStatus.ON_THE_WAY,
        },
      }) as never,
    );

    const result = await service.markCurrentRiderOnTheWay(currentUser, {
      deliveryId: 'delivery_1',
    });

    expect(ordersRepository.updateOrderStatus).toHaveBeenCalledWith(
      'order_1',
      expect.objectContaining({
        status: OrderStatus.ON_THE_WAY,
        reasonCode: 'rider_on_the_way',
      }),
      {},
    );
    expect(result).toMatchObject({
      status: DeliveryStatus.ON_THE_WAY,
    });
  });

  it('marks an in-transit delivery as failed with a required reason code', async () => {
    const {
      deliveriesRepository,
      ordersRepository,
      deliveryQueryService,
      service,
    } = makeService();
    deliveriesRepository.findRiderDeliveryById
      .mockResolvedValueOnce(
        makeDeliveryRecord({
          status: DeliveryStatus.ON_THE_WAY,
          order: {
            status: OrderStatus.ON_THE_WAY,
          },
        }),
      )
      .mockResolvedValueOnce(
        makeDeliveryRecord({
          status: DeliveryStatus.FAILED,
          order: {
            status: OrderStatus.FAILED_DELIVERY,
          },
          failedAt: new Date('2026-04-19T10:30:00.000Z'),
          failureReasonCode: 'customer_unreachable',
          failureNote: 'Phone unreachable',
        }),
      );
    deliveriesRepository.updateById.mockResolvedValue({} as never);
    ordersRepository.updateOrderStatus.mockResolvedValue({} as never);
    deliveryQueryService.buildDeliveryDetail.mockReturnValue(
      makeDeliveryDetail({
        status: DeliveryStatus.FAILED,
        failureReasonCode: 'customer_unreachable',
        failureNote: 'Phone unreachable',
        order: {
          orderId: 'order_1',
          orderStatus: OrderStatus.FAILED_DELIVERY,
        },
      }) as never,
    );

    const result = await service.failCurrentRiderDelivery(currentUser, {
      deliveryId: 'delivery_1',
      reasonCode: 'customer_unreachable',
      note: 'Phone unreachable',
    });

    expect(deliveriesRepository.updateById).toHaveBeenCalledWith(
      'delivery_1',
      expect.objectContaining({
        status: DeliveryStatus.FAILED,
        failureReasonCode: 'customer_unreachable',
        failureNote: 'Phone unreachable',
      }),
      {},
    );
    expect(ordersRepository.updateOrderStatus).toHaveBeenCalledWith(
      'order_1',
      expect.objectContaining({
        status: OrderStatus.FAILED_DELIVERY,
        reasonCode: 'customer_unreachable',
      }),
      {},
    );
    expect(result).toMatchObject({
      status: DeliveryStatus.FAILED,
      failureReasonCode: 'customer_unreachable',
    });
  });

  it('rejects invalid rider delivery transitions', async () => {
    const {
      deliveriesRepository,
      service,
    } = makeService();
    deliveriesRepository.findRiderDeliveryById.mockResolvedValue(
      makeDeliveryRecord({
        status: DeliveryStatus.PICKED_UP,
        order: {
          status: OrderStatus.PICKED_UP,
        },
      }),
    );

    await expect(
      service.acceptCurrentRiderDeliveryRequest(currentUser, {
        deliveryId: 'delivery_1',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
    });
  });

  it('rejects failed delivery requests without a reason code', async () => {
    const {
      deliveriesRepository,
      service,
    } = makeService();
    deliveriesRepository.findRiderDeliveryById.mockResolvedValue(
      makeDeliveryRecord({
        status: DeliveryStatus.ON_THE_WAY,
        order: {
          status: OrderStatus.ON_THE_WAY,
        },
      }),
    );

    await expect(
      service.failCurrentRiderDelivery(currentUser, {
        deliveryId: 'delivery_1',
        reasonCode: '   ',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
    });
  });
});
