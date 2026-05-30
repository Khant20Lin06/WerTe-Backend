"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const checkout_submission_entity_1 = require("../../checkout/entities/checkout-submission.entity");
const order_detail_entity_1 = require("../entities/order-detail.entity");
const order_summary_entity_1 = require("../entities/order-summary.entity");
let OrdersRepository = class OrdersRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(payload) {
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
    findMany() {
        return this.findRecentOrderSummaries();
    }
    findRecentOrderSummaries(limit = 20, client = this.prisma) {
        return client.order.findMany({
            include: order_summary_entity_1.orderSummaryInclude,
            orderBy: [{ placedAt: 'desc' }, { id: 'desc' }],
            take: limit,
        });
    }
    findCustomerOrderSummaries(customerProfileId, limit = 20, client = this.prisma) {
        return client.order.findMany({
            where: {
                customerProfileId,
            },
            include: order_summary_entity_1.orderSummaryInclude,
            orderBy: [{ placedAt: 'desc' }, { id: 'desc' }],
            take: limit,
        });
    }
    findMerchantOrderSummaries(merchantId, limit = 20, client = this.prisma) {
        return client.order.findMany({
            where: {
                branch: {
                    is: {
                        merchantId,
                    },
                },
            },
            include: order_summary_entity_1.orderSummaryInclude,
            orderBy: [{ placedAt: 'desc' }, { id: 'desc' }],
            take: limit,
        });
    }
    findRiderOrderSummaries(riderId, limit = 20, client = this.prisma) {
        return client.order.findMany({
            where: {
                delivery: {
                    is: {
                        riderId,
                    },
                },
            },
            include: order_summary_entity_1.orderSummaryInclude,
            orderBy: [{ placedAt: 'desc' }, { id: 'desc' }],
            take: limit,
        });
    }
    findOrderDetailById(orderId, client = this.prisma) {
        return client.order.findUnique({
            where: {
                id: orderId,
            },
            include: order_detail_entity_1.orderDetailInclude,
        });
    }
    findCustomerOrderDetail(orderId, customerProfileId, client = this.prisma) {
        return client.order.findFirst({
            where: {
                id: orderId,
                customerProfileId,
            },
            include: order_detail_entity_1.orderDetailInclude,
        });
    }
    findMerchantOrderDetail(orderId, merchantId, client = this.prisma) {
        return client.order.findFirst({
            where: {
                id: orderId,
                branch: {
                    is: {
                        merchantId,
                    },
                },
            },
            include: order_detail_entity_1.orderDetailInclude,
        });
    }
    findRiderOrderDetail(orderId, riderId, client = this.prisma) {
        return client.order.findFirst({
            where: {
                id: orderId,
                delivery: {
                    is: {
                        riderId,
                    },
                },
            },
            include: order_detail_entity_1.orderDetailInclude,
        });
    }
    async findOrderTimelineById(orderId, client = this.prisma) {
        const order = await client.order.findUnique({
            where: {
                id: orderId,
            },
            select: {
                statusHistory: {
                    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
                    select: order_detail_entity_1.orderTimelineSelect,
                },
            },
        });
        return order?.statusHistory ?? null;
    }
    updateOrderStatus(orderId, payload, client = this.prisma) {
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
            include: order_detail_entity_1.orderDetailInclude,
        });
    }
    findByIdempotencyKey(idempotencyKey, client = this.prisma) {
        return client.order.findUnique({
            where: {
                idempotencyKey,
            },
            select: checkout_submission_entity_1.checkoutSubmissionSelect,
        });
    }
    createCheckoutOrder(payload, client = this.prisma) {
        return client.order.create({
            data: {
                orderCode: payload.orderCode,
                customerProfileId: payload.customerProfileId,
                branchId: payload.branchId,
                addressId: payload.addressId,
                cartId: payload.cartId,
                idempotencyKey: payload.idempotencyKey,
                status: payload.status,
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
                        unitBasePriceSnapshot: cartItem.unitBasePriceSnapshot,
                        unitPriceSnapshot: cartItem.unitPriceSnapshot,
                        quantity: cartItem.quantity,
                        lineTotal: cartItem.lineTotal,
                        selectedOptions: {
                            create: cartItem.selectedOptions.map((selectedOption) => ({
                                itemOptionId: selectedOption.itemOptionId,
                                optionGroupId: selectedOption.optionGroupId,
                                optionGroupNameSnapshot: selectedOption.optionGroupNameSnapshot,
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
            select: checkout_submission_entity_1.checkoutSubmissionSelect,
        });
    }
};
exports.OrdersRepository = OrdersRepository;
exports.OrdersRepository = OrdersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersRepository);
//# sourceMappingURL=orders.repository.js.map