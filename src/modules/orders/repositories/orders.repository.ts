import { Injectable } from '@nestjs/common';
import {
  DeliveryType,
  ItemOptionGroupKind,
  OrderStatus,
  Prisma,
  PromotionDiscountType,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { checkoutSubmissionSelect, CheckoutSubmissionRecord } from '../../checkout/entities/checkout-submission.entity';
import {
  orderDetailInclude,
  OrderDetailRecord,
  orderTimelineSelect,
  OrderTimelineEntryRecord,
} from '../entities/order-detail.entity';
import {
  orderSummaryInclude,
  OrderSummaryRecord,
} from '../entities/order-summary.entity';

type OrderDatabaseClient = PrismaService | Prisma.TransactionClient;

type CreateCheckoutOrderInput = {
  orderCode: string;
  customerProfileId: string;
  branchId: string;
  addressId?: string | null;
  cartId: string;
  idempotencyKey: string;
  deliveryType: DeliveryType;
  promotionId?: string | null;
  promotionCodeSnapshot?: string | null;
  promotionNameSnapshot?: string | null;
  promotionDiscountTypeSnapshot?: PromotionDiscountType | null;
  status: 'PLACED';
  currencyCode: string;
  subtotalAmount: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  deliveryFee: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
  deliveryLabel?: string | null;
  deliveryLine1?: string | null;
  deliveryLine2?: string | null;
  deliveryLandmark?: string | null;
  deliveryTownship?: string | null;
  deliveryCity?: string | null;
  deliveryPostalCode?: string | null;
  deliveryInstructions?: string | null;
  deliveryLatitude?: Prisma.Decimal | null;
  deliveryLongitude?: Prisma.Decimal | null;
  changedByUserId: string;
  cartItems: Array<{
    menuItemId: string;
    categoryId?: string | null;
    nameSnapshot: string;
    descriptionSnapshot?: string | null;
    imageUrlSnapshot?: string | null;
    selectedVariantCombinationId?: string | null;
    selectedVariantCombinationNameSnapshot?: string | null;
    menuItemStockTrackedSnapshot: boolean;
    variantCombinationStockTrackedSnapshot: boolean;
    unitBasePriceSnapshot: Prisma.Decimal;
    unitPriceSnapshot: Prisma.Decimal;
    quantity: number;
    lineTotal: Prisma.Decimal;
    inventoryLotAllocations: Array<{
      inventoryLotId: string;
      batchNoSnapshot: string;
      expiryDateSnapshot: string | null;
      quantity: number;
    }>;
    selectedOptions: Array<{
      itemOptionId: string;
      optionGroupId: string;
      optionGroupNameSnapshot: string;
      optionGroupKindSnapshot: ItemOptionGroupKind;
      itemOptionStockTrackedSnapshot: boolean;
      nameSnapshot: string;
      priceDeltaSnapshot: Prisma.Decimal;
    }>;
  }>;
};

type UpdateOrderStatusInput = {
  status: OrderStatus;
  fromStatus: OrderStatus;
  changedByUserId: string;
  reasonCode?: string | null;
  note?: string | null;
};

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(payload: { customerProfileId: string; branchId: string }) {
    return this.prisma.order.create({
      data: {
        orderCode: `ORD-${Date.now()}`,
        customerProfileId: payload.customerProfileId,
        branchId: payload.branchId,
        totalAmount: 0,
        status: 'PLACED',
      },
    });
  }

  findMany(): Promise<OrderSummaryRecord[]> {
    return this.findRecentOrderSummaries();
  }

  findRecentOrderSummaries(
    limit = 20,
    client: OrderDatabaseClient = this.prisma,
  ): Promise<OrderSummaryRecord[]> {
    return client.order.findMany({
      include: orderSummaryInclude,
      orderBy: [{ placedAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  findCustomerOrderSummaries(
    customerProfileId: string,
    options: { limit?: number; page?: number } = {},
    client: OrderDatabaseClient = this.prisma,
  ): Promise<OrderSummaryRecord[]> {
    const limit = options.limit ?? 20;
    const page = options.page ?? 1;
    return client.order.findMany({
      where: { customerProfileId },
      include: orderSummaryInclude,
      orderBy: [{ placedAt: 'desc' }, { id: 'desc' }],
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  findMerchantOrderSummaries(
    merchantId: string,
    options: { branchId?: string; limit?: number } = {},
    client: OrderDatabaseClient = this.prisma,
  ): Promise<OrderSummaryRecord[]> {
    const { branchId, limit = 20 } = options;
    return client.order.findMany({
      where: {
        branch: {
          is: {
            merchantId,
            ...(branchId ? { id: branchId } : {}),
          },
        },
      },
      include: orderSummaryInclude,
      orderBy: [{ placedAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  findRiderOrderSummaries(
    riderId: string,
    limit = 20,
    client: OrderDatabaseClient = this.prisma,
  ): Promise<OrderSummaryRecord[]> {
    return client.order.findMany({
      where: {
        delivery: {
          is: {
            riderId,
          },
        },
      },
      include: orderSummaryInclude,
      orderBy: [{ placedAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  findOrderDetailById(
    orderId: string,
    client: OrderDatabaseClient = this.prisma,
  ): Promise<OrderDetailRecord | null> {
    return client.order.findUnique({
      where: {
        id: orderId,
      },
      include: orderDetailInclude,
    });
  }

  findCustomerOrderDetail(
    orderId: string,
    customerProfileId: string,
    client: OrderDatabaseClient = this.prisma,
  ): Promise<OrderDetailRecord | null> {
    return client.order.findFirst({
      where: {
        id: orderId,
        customerProfileId,
      },
      include: orderDetailInclude,
    });
  }

  findMerchantOrderDetail(
    orderId: string,
    merchantId: string,
    client: OrderDatabaseClient = this.prisma,
  ): Promise<OrderDetailRecord | null> {
    return client.order.findFirst({
      where: {
        id: orderId,
        branch: {
          is: {
            merchantId,
          },
        },
      },
      include: orderDetailInclude,
    });
  }

  findRiderOrderDetail(
    orderId: string,
    riderId: string,
    client: OrderDatabaseClient = this.prisma,
  ): Promise<OrderDetailRecord | null> {
    return client.order.findFirst({
      where: {
        id: orderId,
        delivery: {
          is: {
            riderId,
          },
        },
      },
      include: orderDetailInclude,
    });
  }

  async findOrderTimelineById(
    orderId: string,
    client: OrderDatabaseClient = this.prisma,
  ): Promise<OrderTimelineEntryRecord[] | null> {
    const order = await client.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        statusHistory: {
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          select: orderTimelineSelect,
        },
      },
    });

    return order?.statusHistory ?? null;
  }

  updateOrderStatus(
    orderId: string,
    payload: UpdateOrderStatusInput,
    client: OrderDatabaseClient = this.prisma,
  ): Promise<OrderDetailRecord> {
    return client.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: payload.status,
        statusHistory: {
          create: {
            fromStatus: payload.fromStatus,
            toStatus: payload.status,
            changedByUserId: payload.changedByUserId,
            reasonCode: payload.reasonCode ?? null,
            note: payload.note ?? null,
          },
        },
      },
      include: orderDetailInclude,
    });
  }

  findByIdempotencyKey(
    idempotencyKey: string,
    client: OrderDatabaseClient = this.prisma,
  ): Promise<CheckoutSubmissionRecord | null> {
    return client.order.findUnique({
      where: {
        idempotencyKey,
      },
      select: checkoutSubmissionSelect,
    });
  }

  createCheckoutOrder(
    payload: CreateCheckoutOrderInput,
    client: OrderDatabaseClient = this.prisma,
  ): Promise<CheckoutSubmissionRecord> {
    return client.order.create({
      data: {
        orderCode: payload.orderCode,
        customerProfileId: payload.customerProfileId,
        branchId: payload.branchId,
        addressId: payload.addressId,
        cartId: payload.cartId,
        idempotencyKey: payload.idempotencyKey,
        promotionId: payload.promotionId,
        promotionCodeSnapshot: payload.promotionCodeSnapshot,
        promotionNameSnapshot: payload.promotionNameSnapshot,
        promotionDiscountTypeSnapshot: payload.promotionDiscountTypeSnapshot,
        status: payload.status,
        deliveryType: payload.deliveryType,
        currencyCode: payload.currencyCode,
        subtotalAmount: payload.subtotalAmount,
        discountAmount: payload.discountAmount,
        deliveryFee: payload.deliveryFee,
        totalAmount: payload.totalAmount,
        deliveryLabel: payload.deliveryLabel,
        deliveryLine1: payload.deliveryLine1,
        deliveryLine2: payload.deliveryLine2,
        deliveryLandmark: payload.deliveryLandmark,
        deliveryTownship: payload.deliveryTownship,
        deliveryCity: payload.deliveryCity,
        deliveryPostalCode: payload.deliveryPostalCode,
        deliveryInstructions: payload.deliveryInstructions,
        deliveryLatitude: payload.deliveryLatitude,
        deliveryLongitude: payload.deliveryLongitude,
        items: {
          create: payload.cartItems.map((cartItem) => ({
            menuItemId: cartItem.menuItemId,
            categoryId: cartItem.categoryId,
            nameSnapshot: cartItem.nameSnapshot,
            descriptionSnapshot: cartItem.descriptionSnapshot,
            imageUrlSnapshot: cartItem.imageUrlSnapshot,
            selectedVariantCombinationId:
              cartItem.selectedVariantCombinationId,
            selectedVariantCombinationNameSnapshot:
              cartItem.selectedVariantCombinationNameSnapshot,
            menuItemStockTrackedSnapshot:
              cartItem.menuItemStockTrackedSnapshot,
            variantCombinationStockTrackedSnapshot:
              cartItem.variantCombinationStockTrackedSnapshot,
            unitBasePriceSnapshot: cartItem.unitBasePriceSnapshot,
            unitPriceSnapshot: cartItem.unitPriceSnapshot,
            quantity: cartItem.quantity,
            lineTotal: cartItem.lineTotal,
            inventoryLotAllocations: {
              create: cartItem.inventoryLotAllocations.map((allocation) => ({
                inventoryLotId: allocation.inventoryLotId,
                batchNoSnapshot: allocation.batchNoSnapshot,
                expiryDateSnapshot:
                  allocation.expiryDateSnapshot === null
                    ? null
                    : new Date(allocation.expiryDateSnapshot),
                quantity: allocation.quantity,
              })),
            },
            selectedOptions: {
              create: cartItem.selectedOptions.map((selectedOption) => ({
                itemOptionId: selectedOption.itemOptionId,
                optionGroupId: selectedOption.optionGroupId,
                optionGroupNameSnapshot:
                  selectedOption.optionGroupNameSnapshot,
                optionGroupKindSnapshot:
                  selectedOption.optionGroupKindSnapshot,
                itemOptionStockTrackedSnapshot:
                  selectedOption.itemOptionStockTrackedSnapshot,
                nameSnapshot: selectedOption.nameSnapshot,
                priceDeltaSnapshot: selectedOption.priceDeltaSnapshot,
              })),
            },
          })),
        },
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: payload.status,
            changedByUserId: payload.changedByUserId,
            reasonCode: 'checkout_submitted',
          },
        },
      },
      select: checkoutSubmissionSelect,
    });
  }
}
