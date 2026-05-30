import {
  BranchStatus,
  DeliveryStatus,
  MerchantStatus,
  OrderStatus,
  Prisma,
  RiderStatus,
  UserStatus,
} from '@prisma/client';

export const dispatchQueueOrderInclude =
  Prisma.validator<Prisma.OrderInclude>()({
    customerProfile: {
      select: {
        id: true,
        fullName: true,
        user: {
          select: {
            id: true,
            phone: true,
            status: true,
          },
        },
      },
    },
    branch: {
      select: {
        id: true,
        name: true,
        status: true,
        township: true,
        merchant: {
          select: {
            id: true,
            userId: true,
            name: true,
            status: true,
          },
        },
      },
    },
    delivery: {
      select: {
        id: true,
        riderId: true,
        status: true,
        etaMinutes: true,
        assignedAt: true,
        acceptedAt: true,
        rider: {
          select: {
            id: true,
            userId: true,
            displayName: true,
            vehicleType: true,
            currentTownship: true,
            status: true,
            user: {
              select: {
                id: true,
                phone: true,
                status: true,
              },
            },
            availability: {
              select: {
                isOnline: true,
                isAvailable: true,
                lastStatusChangedAt: true,
              },
            },
            currentLocation: {
              select: {
                latitude: true,
                longitude: true,
                recordedAt: true,
              },
            },
          },
        },
      },
    },
  });

export type DispatchQueueEntryRecord = Prisma.OrderGetPayload<{
  include: typeof dispatchQueueOrderInclude;
}>;

export class DispatchQueueCustomerEntity {
  customerProfileId!: string;
  userId!: string;
  phone!: string;
  userStatus!: UserStatus;
  fullName!: string | null;
}

export class DispatchQueueBranchEntity {
  branchId!: string;
  branchName!: string;
  branchStatus!: BranchStatus;
  township!: string;
  merchantId!: string;
  merchantUserId!: string;
  merchantName!: string;
  merchantStatus!: MerchantStatus;
}

export class DispatchQueueRiderAvailabilityEntity {
  isOnline!: boolean;
  isAvailable!: boolean;
  lastStatusChangedAt!: string;
}

export class DispatchQueueRiderLocationEntity {
  latitude!: string;
  longitude!: string;
  recordedAt!: string;
}

export class DispatchQueueRiderEntity {
  riderId!: string;
  userId!: string;
  phone!: string;
  userStatus!: UserStatus;
  displayName!: string;
  vehicleType!: string;
  currentTownship!: string | null;
  status!: RiderStatus;
  availability!: DispatchQueueRiderAvailabilityEntity | null;
  currentLocation!: DispatchQueueRiderLocationEntity | null;
}

export class DispatchQueueDeliveryEntity {
  deliveryId!: string;
  riderId!: string | null;
  status!: DeliveryStatus;
  etaMinutes!: number | null;
  assignedAt!: string | null;
  acceptedAt!: string | null;
  rider!: DispatchQueueRiderEntity | null;
}

export class DispatchQueueEntryEntity {
  orderId!: string;
  orderCode!: string;
  orderStatus!: OrderStatus;
  queueState!: 'awaiting_assignment' | 'awaiting_rider_acceptance';
  currencyCode!: string;
  totalAmount!: string;
  deliveryTownship!: string | null;
  deliveryLatitude!: string | null;
  deliveryLongitude!: string | null;
  placedAt!: string;
  updatedAt!: string;
  customer!: DispatchQueueCustomerEntity;
  branch!: DispatchQueueBranchEntity;
  delivery!: DispatchQueueDeliveryEntity | null;
}

export function buildDispatchQueueEntry(
  order: DispatchQueueEntryRecord,
): DispatchQueueEntryEntity {
  const queueState =
    order.delivery === null || order.delivery.status === DeliveryStatus.PENDING_ASSIGNMENT
      ? 'awaiting_assignment'
      : 'awaiting_rider_acceptance';

  return {
    orderId: order.id,
    orderCode: order.orderCode,
    orderStatus: order.status,
    queueState,
    currencyCode: order.currencyCode,
    totalAmount: order.totalAmount.toString(),
    deliveryTownship: order.deliveryTownship,
    deliveryLatitude: order.deliveryLatitude?.toString() ?? null,
    deliveryLongitude: order.deliveryLongitude?.toString() ?? null,
    placedAt: order.placedAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    customer: {
      customerProfileId: order.customerProfile.id,
      userId: order.customerProfile.user.id,
      phone: order.customerProfile.user.phone,
      userStatus: order.customerProfile.user.status,
      fullName: order.customerProfile.fullName,
    },
    branch: {
      branchId: order.branch.id,
      branchName: order.branch.name,
      branchStatus: order.branch.status,
      township: order.branch.township,
      merchantId: order.branch.merchant.id,
      merchantUserId: order.branch.merchant.userId,
      merchantName: order.branch.merchant.name,
      merchantStatus: order.branch.merchant.status,
    },
    delivery:
      order.delivery === null
        ? null
        : {
            deliveryId: order.delivery.id,
            riderId: order.delivery.riderId,
            status: order.delivery.status,
            etaMinutes: order.delivery.etaMinutes,
            assignedAt: order.delivery.assignedAt?.toISOString() ?? null,
            acceptedAt: order.delivery.acceptedAt?.toISOString() ?? null,
            rider:
              order.delivery.rider === null
                ? null
                : {
                    riderId: order.delivery.rider.id,
                    userId: order.delivery.rider.user.id,
                    phone: order.delivery.rider.user.phone,
                    userStatus: order.delivery.rider.user.status,
                    displayName: order.delivery.rider.displayName,
                    vehicleType: order.delivery.rider.vehicleType,
                    currentTownship: order.delivery.rider.currentTownship,
                    status: order.delivery.rider.status,
                    availability:
                      order.delivery.rider.availability === null
                        ? null
                        : {
                            isOnline:
                              order.delivery.rider.availability.isOnline,
                            isAvailable:
                              order.delivery.rider.availability.isAvailable,
                            lastStatusChangedAt:
                              order.delivery.rider.availability.lastStatusChangedAt.toISOString(),
                          },
                    currentLocation:
                      order.delivery.rider.currentLocation === null
                        ? null
                        : {
                            latitude:
                              order.delivery.rider.currentLocation.latitude.toString(),
                            longitude:
                              order.delivery.rider.currentLocation.longitude.toString(),
                            recordedAt:
                              order.delivery.rider.currentLocation.recordedAt.toISOString(),
                          },
                  },
          },
  };
}
