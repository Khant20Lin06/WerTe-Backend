import { HttpStatus } from '@nestjs/common';
import {
  DeliveryStatus,
  OrderStatus,
  RiderStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { DeliveryDetailRecord } from '../../../../src/modules/deliveries/entities/delivery-detail.entity';
import { DeliveriesRepository } from '../../../../src/modules/deliveries/repositories/deliveries.repository';
import { SystemMessageService } from '../../../../src/modules/messaging/services/system-message.service';
import { OrderDetailEntity } from '../../../../src/modules/orders/entities/order-detail.entity';
import { OrderPolicyService } from '../../../../src/modules/orders/policies/order-policy.service';
import { OrdersRepository } from '../../../../src/modules/orders/repositories/orders.repository';
import { OrderQueryService } from '../../../../src/modules/orders/services/order-query.service';
import { RiderOwnershipRecord } from '../../../../src/modules/riders/entities/rider-ownership.entity';
import { RidersService } from '../../../../src/modules/riders/services/riders.service';
import { DispatchAssignmentService } from '../../../../src/modules/dispatch/services/dispatch-assignment.service';

function makeOrderDetail(
  overrides?: Partial<OrderDetailEntity>,
): OrderDetailEntity {
  return {
    orderId: 'order_1',
    orderCode: 'ORD-00000001',
    customerProfileId: 'cust_prof_1',
    branchId: 'branch_1',
    addressId: 'addr_1',
    cartId: 'cart_1',
    status: OrderStatus.PREPARING,
    currencyCode: 'MMK',
    subtotalAmount: '6500',
    discountAmount: '0',
    deliveryFee: '500',
    totalAmount: '7000',
    placedAt: '2026-04-19T10:00:00.000Z',
    updatedAt: '2026-04-19T10:05:00.000Z',
    availableActions: ['admin_assign_rider', 'admin_cancel', 'admin_override_status'],
    customer: {
      customerProfileId: 'cust_prof_1',
      userId: 'usr_customer_1',
      phone: '09123456789',
      userStatus: UserStatus.ACTIVE,
      fullName: 'Mg Mg',
      avatarUrl: null,
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
    delivery: null,
    deliveryAddress: {
      addressId: 'addr_1',
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
    items: [],
    timeline: [],
    ...overrides,
  };
}

function makeRider(
  overrides?: Partial<RiderOwnershipRecord>,
): RiderOwnershipRecord {
  return {
    id: 'rider_1',
    userId: 'usr_rider_1',
    displayName: 'Ko Aung',
    vehicleType: 'bike',
    currentTownship: 'Pabedan',
    status: RiderStatus.ACTIVE,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    user: {
      id: 'usr_rider_1',
      phone: '0999999999',
      role: UserRole.RIDER,
      status: UserStatus.ACTIVE,
    },
    availability: {
      isOnline: true,
      isAvailable: true,
      lastStatusChangedAt: new Date('2026-04-19T00:05:00.000Z'),
      updatedAt: new Date('2026-04-19T00:05:00.000Z'),
    },
    ...overrides,
  };
}

describe('DispatchAssignmentService', () => {
  const currentUser = makeAuthenticatedUser({
    userId: 'usr_admin_1',
    role: UserRole.ADMIN,
    actorContext: {
      userId: 'usr_admin_1',
      phone: '0990000000',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const makeService = () => {
    const prisma = {
      runInTransaction: jest
        .fn()
        .mockImplementation(async (operation) => operation({})),
    } as unknown as jest.Mocked<PrismaService>;
    const ordersRepository = {
      findOrderDetailById: jest.fn(),
      updateOrderStatus: jest.fn(),
    } as unknown as jest.Mocked<OrdersRepository>;
    const orderQueryService = {
      buildOrderDetail: jest.fn(),
      attachAvailableActions: jest.fn(),
    } as unknown as jest.Mocked<OrderQueryService>;
    const deliveriesRepository = {
      upsertAssignedDelivery: jest.fn(),
    } as unknown as jest.Mocked<DeliveriesRepository>;
    const ridersService = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<RidersService>;
    const systemMessageService = {
      publishOrderEvent: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SystemMessageService>;
    const service = new DispatchAssignmentService(
      prisma,
      ordersRepository,
      orderQueryService,
      new OrderPolicyService(),
      deliveriesRepository,
      ridersService,
      systemMessageService,
    );

    return {
      prisma,
      ordersRepository,
      orderQueryService,
      deliveriesRepository,
      ridersService,
      systemMessageService,
      service,
    };
  };

  it('assigns a rider to a preparing order and transitions the order to rider_assigned', async () => {
    const {
      prisma,
      ordersRepository,
      orderQueryService,
      deliveriesRepository,
      ridersService,
      systemMessageService,
      service,
    } = makeService();
    const currentOrder = makeOrderDetail({
      status: OrderStatus.PREPARING,
    });
    const assignedOrder = makeOrderDetail({
      status: OrderStatus.RIDER_ASSIGNED,
      availableActions: ['admin_cancel', 'admin_override_status'],
      delivery: {
        deliveryId: 'delivery_1',
        riderId: 'rider_1',
        etaMinutes: 18,
        rider: {
          riderId: 'rider_1',
          userId: 'usr_rider_1',
          phone: '0999999999',
          userStatus: UserStatus.ACTIVE,
          displayName: 'Ko Aung',
          vehicleType: 'bike',
          currentTownship: 'Pabedan',
          status: RiderStatus.ACTIVE,
        },
      },
    });

    ordersRepository.findOrderDetailById
      .mockResolvedValueOnce({
        status: OrderStatus.PREPARING,
      } as never)
      .mockResolvedValueOnce({} as never);
    orderQueryService.buildOrderDetail
      .mockReturnValueOnce(currentOrder)
      .mockReturnValueOnce(assignedOrder);
    orderQueryService.attachAvailableActions.mockImplementation(
      (_currentUser, order) => order,
    );
    ridersService.findById.mockResolvedValue(makeRider());
    deliveriesRepository.upsertAssignedDelivery.mockResolvedValue(
      {} as DeliveryDetailRecord,
    );
    ordersRepository.updateOrderStatus.mockResolvedValue({} as never);

    const result = await service.assignRiderToOrder(currentUser, {
      orderId: 'order_1',
      riderId: 'rider_1',
      etaMinutes: 18,
    });

    expect(prisma.runInTransaction).toHaveBeenCalled();
    expect(deliveriesRepository.upsertAssignedDelivery).toHaveBeenCalledWith(
      'order_1',
      expect.objectContaining({
        riderId: 'rider_1',
        etaMinutes: 18,
      }),
      {},
    );
    expect(ordersRepository.updateOrderStatus).toHaveBeenCalledWith(
      'order_1',
      expect.objectContaining({
        status: OrderStatus.RIDER_ASSIGNED,
        fromStatus: OrderStatus.PREPARING,
        changedByUserId: 'usr_admin_1',
        reasonCode: 'admin_assigned_rider',
      }),
      {},
    );
    expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(
      currentUser,
      expect.objectContaining({
        orderId: 'order_1',
        code: 'RIDER_ASSIGNED',
      }),
    );
    expect(result.status).toBe(OrderStatus.RIDER_ASSIGNED);
  });

  it('returns the current order when the same rider is already assigned', async () => {
    const { ordersRepository, orderQueryService, service } = makeService();
    const assignedOrder = makeOrderDetail({
      status: OrderStatus.RIDER_ASSIGNED,
      delivery: {
        deliveryId: 'delivery_1',
        riderId: 'rider_1',
        etaMinutes: 18,
        rider: {
          riderId: 'rider_1',
          userId: 'usr_rider_1',
          phone: '0999999999',
          userStatus: UserStatus.ACTIVE,
          displayName: 'Ko Aung',
          vehicleType: 'bike',
          currentTownship: 'Pabedan',
          status: RiderStatus.ACTIVE,
        },
      },
    });

    ordersRepository.findOrderDetailById.mockResolvedValue({
      status: OrderStatus.RIDER_ASSIGNED,
    } as never);
    orderQueryService.buildOrderDetail.mockReturnValue(assignedOrder);
    orderQueryService.attachAvailableActions.mockImplementation(
      (_currentUser, order) => order,
    );

    const result = await service.assignRiderToOrder(currentUser, {
      orderId: 'order_1',
      riderId: 'rider_1',
    });

    expect(result.status).toBe(OrderStatus.RIDER_ASSIGNED);
  });

  it('rejects assignment when the order is not in preparing state', async () => {
    const { ordersRepository, orderQueryService, service } = makeService();
    ordersRepository.findOrderDetailById.mockResolvedValue({
      status: OrderStatus.DELIVERED,
    } as never);
    orderQueryService.buildOrderDetail.mockReturnValue(
      makeOrderDetail({
        status: OrderStatus.DELIVERED,
        availableActions: ['admin_override_status'],
      }),
    );

    await expect(
      service.assignRiderToOrder(currentUser, {
        orderId: 'order_1',
        riderId: 'rider_1',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
    });
  });

  it('rejects assignment when the order cannot be found', async () => {
    const { ordersRepository, service } = makeService();
    ordersRepository.findOrderDetailById.mockResolvedValue(null);

    await expect(
      service.assignRiderToOrder(currentUser, {
        orderId: 'order_missing',
        riderId: 'rider_1',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('rejects assignment when the rider is not available for dispatch', async () => {
    const {
      ordersRepository,
      orderQueryService,
      ridersService,
      service,
    } = makeService();
    ordersRepository.findOrderDetailById.mockResolvedValue({
      status: OrderStatus.PREPARING,
    } as never);
    orderQueryService.buildOrderDetail.mockReturnValue(
      makeOrderDetail({
        status: OrderStatus.PREPARING,
      }),
    );
    ridersService.findById.mockResolvedValue(
      makeRider({
        availability: {
          isOnline: false,
          isAvailable: false,
          lastStatusChangedAt: new Date('2026-04-19T00:05:00.000Z'),
          updatedAt: new Date('2026-04-19T00:05:00.000Z'),
        },
      }),
    );

    await expect(
      service.assignRiderToOrder(currentUser, {
        orderId: 'order_1',
        riderId: 'rider_1',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
    });
  });

  it('rejects assignment when the rider cannot be found', async () => {
    const {
      ordersRepository,
      orderQueryService,
      ridersService,
      service,
    } = makeService();
    ordersRepository.findOrderDetailById.mockResolvedValue({
      status: OrderStatus.PREPARING,
    } as never);
    orderQueryService.buildOrderDetail.mockReturnValue(
      makeOrderDetail({
        status: OrderStatus.PREPARING,
      }),
    );
    ridersService.findById.mockResolvedValue(null);

    await expect(
      service.assignRiderToOrder(currentUser, {
        orderId: 'order_1',
        riderId: 'rider_missing',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
    });
  });
});
