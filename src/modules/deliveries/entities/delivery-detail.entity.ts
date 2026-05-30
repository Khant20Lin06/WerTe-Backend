import {
  BranchStatus,
  DeliveryStatus,
  MerchantStatus,
  Prisma,
  RiderStatus,
  UserStatus,
} from '@prisma/client';

export const deliveryLinkedOrderSelect =
  Prisma.validator<Prisma.OrderSelect>()({
    id: true,
    orderCode: true,
    status: true,
    currencyCode: true,
    subtotalAmount: true,
    discountAmount: true,
    deliveryFee: true,
    totalAmount: true,
    deliveryLabel: true,
    deliveryLine1: true,
    deliveryLine2: true,
    deliveryLandmark: true,
    deliveryTownship: true,
    deliveryCity: true,
    deliveryPostalCode: true,
    deliveryInstructions: true,
    deliveryLatitude: true,
    deliveryLongitude: true,
    placedAt: true,
    updatedAt: true,
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
  });

export const deliveryRiderSelect = Prisma.validator<Prisma.RiderSelect>()({
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
      updatedAt: true,
    },
  },
  currentLocation: {
    select: {
      latitude: true,
      longitude: true,
      heading: true,
      speed: true,
      accuracyMeters: true,
      recordedAt: true,
      deliveryId: true,
    },
  },
});

export const deliveryDetailInclude =
  Prisma.validator<Prisma.DeliveryInclude>()({
    order: {
      select: deliveryLinkedOrderSelect,
    },
    rider: {
      select: deliveryRiderSelect,
    },
  });

export type DeliveryDetailRecord = Prisma.DeliveryGetPayload<{
  include: typeof deliveryDetailInclude;
}>;

export class DeliveryDetailOrderCustomerEntity {
  customerProfileId!: string;
  userId!: string;
  phone!: string;
  userStatus!: UserStatus;
  fullName!: string | null;
}

export class DeliveryDetailOrderBranchEntity {
  branchId!: string;
  branchName!: string;
  branchStatus!: BranchStatus;
  township!: string;
  merchantId!: string;
  merchantUserId!: string;
  merchantName!: string;
  merchantStatus!: MerchantStatus;
}

export class DeliveryDetailOrderAddressEntity {
  label!: string | null;
  line1!: string | null;
  line2!: string | null;
  landmark!: string | null;
  township!: string | null;
  city!: string | null;
  postalCode!: string | null;
  deliveryInstructions!: string | null;
  latitude!: string | null;
  longitude!: string | null;
}

export class DeliveryDetailOrderEntity {
  orderId!: string;
  orderCode!: string;
  orderStatus!: string;
  currencyCode!: string;
  subtotalAmount!: string;
  discountAmount!: string;
  deliveryFee!: string;
  totalAmount!: string;
  placedAt!: string;
  updatedAt!: string;
  customer!: DeliveryDetailOrderCustomerEntity;
  branch!: DeliveryDetailOrderBranchEntity;
  deliveryAddress!: DeliveryDetailOrderAddressEntity;
}

export class DeliveryDetailRiderAvailabilityEntity {
  isOnline!: boolean;
  isAvailable!: boolean;
  lastStatusChangedAt!: string;
  updatedAt!: string;
}

export class DeliveryDetailRiderLocationEntity {
  latitude!: string;
  longitude!: string;
  heading!: string | null;
  speed!: string | null;
  accuracyMeters!: string | null;
  recordedAt!: string;
  deliveryId!: string | null;
}

export class DeliveryDetailRiderEntity {
  riderId!: string;
  userId!: string;
  phone!: string;
  userStatus!: UserStatus;
  displayName!: string;
  vehicleType!: string;
  currentTownship!: string | null;
  status!: RiderStatus;
  availability!: DeliveryDetailRiderAvailabilityEntity | null;
  currentLocation!: DeliveryDetailRiderLocationEntity | null;
}

export class DeliveryDetailEntity {
  deliveryId!: string;
  orderId!: string;
  riderId!: string | null;
  status!: DeliveryStatus;
  etaMinutes!: number | null;
  assignedAt!: string | null;
  acceptedAt!: string | null;
  pickedUpAt!: string | null;
  onTheWayAt!: string | null;
  deliveredAt!: string | null;
  failedAt!: string | null;
  cancelledAt!: string | null;
  failureReasonCode!: string | null;
  failureNote!: string | null;
  createdAt!: string;
  updatedAt!: string;
  order!: DeliveryDetailOrderEntity;
  rider!: DeliveryDetailRiderEntity | null;
}

export function buildDeliveryDetail(
  delivery: DeliveryDetailRecord,
): DeliveryDetailEntity {
  return {
    deliveryId: delivery.id,
    orderId: delivery.orderId,
    riderId: delivery.riderId,
    status: delivery.status,
    etaMinutes: delivery.etaMinutes,
    assignedAt: delivery.assignedAt?.toISOString() ?? null,
    acceptedAt: delivery.acceptedAt?.toISOString() ?? null,
    pickedUpAt: delivery.pickedUpAt?.toISOString() ?? null,
    onTheWayAt: delivery.onTheWayAt?.toISOString() ?? null,
    deliveredAt: delivery.deliveredAt?.toISOString() ?? null,
    failedAt: delivery.failedAt?.toISOString() ?? null,
    cancelledAt: delivery.cancelledAt?.toISOString() ?? null,
    failureReasonCode: delivery.failureReasonCode,
    failureNote: delivery.failureNote,
    createdAt: delivery.createdAt.toISOString(),
    updatedAt: delivery.updatedAt.toISOString(),
    order: {
      orderId: delivery.order.id,
      orderCode: delivery.order.orderCode,
      orderStatus: delivery.order.status,
      currencyCode: delivery.order.currencyCode,
      subtotalAmount: delivery.order.subtotalAmount.toString(),
      discountAmount: delivery.order.discountAmount.toString(),
      deliveryFee: delivery.order.deliveryFee.toString(),
      totalAmount: delivery.order.totalAmount.toString(),
      placedAt: delivery.order.placedAt.toISOString(),
      updatedAt: delivery.order.updatedAt.toISOString(),
      customer: {
        customerProfileId: delivery.order.customerProfile.id,
        userId: delivery.order.customerProfile.user.id,
        phone: delivery.order.customerProfile.user.phone,
        userStatus: delivery.order.customerProfile.user.status,
        fullName: delivery.order.customerProfile.fullName,
      },
      branch: {
        branchId: delivery.order.branch.id,
        branchName: delivery.order.branch.name,
        branchStatus: delivery.order.branch.status,
        township: delivery.order.branch.township,
        merchantId: delivery.order.branch.merchant.id,
        merchantUserId: delivery.order.branch.merchant.userId,
        merchantName: delivery.order.branch.merchant.name,
        merchantStatus: delivery.order.branch.merchant.status,
      },
      deliveryAddress: {
        label: delivery.order.deliveryLabel,
        line1: delivery.order.deliveryLine1,
        line2: delivery.order.deliveryLine2,
        landmark: delivery.order.deliveryLandmark,
        township: delivery.order.deliveryTownship,
        city: delivery.order.deliveryCity,
        postalCode: delivery.order.deliveryPostalCode,
        deliveryInstructions: delivery.order.deliveryInstructions,
        latitude:
          delivery.order.deliveryLatitude?.toString() ?? null,
        longitude:
          delivery.order.deliveryLongitude?.toString() ?? null,
      },
    },
    rider:
      delivery.rider === null
        ? null
        : {
            riderId: delivery.rider.id,
            userId: delivery.rider.user.id,
            phone: delivery.rider.user.phone,
            userStatus: delivery.rider.user.status,
            displayName: delivery.rider.displayName,
            vehicleType: delivery.rider.vehicleType,
            currentTownship: delivery.rider.currentTownship,
            status: delivery.rider.status,
            availability:
              delivery.rider.availability === null
                ? null
                : {
                    isOnline: delivery.rider.availability.isOnline,
                    isAvailable: delivery.rider.availability.isAvailable,
                    lastStatusChangedAt:
                      delivery.rider.availability.lastStatusChangedAt.toISOString(),
                    updatedAt:
                      delivery.rider.availability.updatedAt.toISOString(),
                  },
            currentLocation:
              delivery.rider.currentLocation === null
                ? null
                : {
                    latitude: delivery.rider.currentLocation.latitude.toString(),
                    longitude:
                      delivery.rider.currentLocation.longitude.toString(),
                    heading:
                      delivery.rider.currentLocation.heading?.toString() ?? null,
                    speed:
                      delivery.rider.currentLocation.speed?.toString() ?? null,
                    accuracyMeters:
                      delivery.rider.currentLocation.accuracyMeters?.toString() ??
                      null,
                    recordedAt:
                      delivery.rider.currentLocation.recordedAt.toISOString(),
                    deliveryId: delivery.rider.currentLocation.deliveryId,
                  },
          },
  };
}
