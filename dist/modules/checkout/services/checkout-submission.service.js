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
exports.CheckoutSubmissionService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const queue_service_1 = require("../../../infrastructure/queue/queue.service");
const carts_repository_1 = require("../../carts/repositories/carts.repository");
const system_message_service_1 = require("../../messaging/services/system-message.service");
const orders_repository_1 = require("../../orders/repositories/orders.repository");
const checkout_submission_entity_1 = require("../entities/checkout-submission.entity");
const checkout_customer_access_policy_helper_1 = require("../policies/checkout-customer-access-policy.helper");
const checkout_context_service_1 = require("./checkout-context.service");
const checkout_pricing_service_1 = require("./checkout-pricing.service");
let CheckoutSubmissionService = class CheckoutSubmissionService {
    constructor(prisma, checkoutContextService, checkoutPricingService, ordersRepository, cartsRepository, queueService, systemMessageService) {
        this.prisma = prisma;
        this.checkoutContextService = checkoutContextService;
        this.checkoutPricingService = checkoutPricingService;
        this.ordersRepository = ordersRepository;
        this.cartsRepository = cartsRepository;
        this.queueService = queueService;
        this.systemMessageService = systemMessageService;
    }
    async submitCurrentCustomerCheckout(currentUser, input) {
        const context = await this.checkoutContextService.getValidatedCurrentCustomerCheckoutContext(currentUser, {
            branchId: input.branchId,
            addressId: input.addressId,
        });
        const pricing = this.checkoutPricingService.buildPricingBreakdown(context);
        try {
            const result = await this.prisma.runInTransaction(async (tx) => {
                const existingOrder = await this.ordersRepository.findByIdempotencyKey(input.idempotencyKey, tx);
                if (existingOrder !== null) {
                    this.assertIdempotentOrderBelongsToCustomer(currentUser, context, existingOrder.customerProfileId);
                    return {
                        order: existingOrder,
                        wasCreated: false,
                    };
                }
                const order = await this.ordersRepository.createCheckoutOrder({
                    orderCode: this.buildOrderCode(),
                    customerProfileId: context.customer.customerProfileId,
                    branchId: context.branch.branchId,
                    addressId: context.address.addressId,
                    cartId: context.cart.cartId,
                    idempotencyKey: input.idempotencyKey,
                    status: client_1.OrderStatus.PLACED,
                    currencyCode: context.currencyCode,
                    subtotalAmount: pricing.subtotalAmount,
                    discountAmount: pricing.discountAmount,
                    deliveryFee: pricing.deliveryFee,
                    totalAmount: pricing.totalAmount,
                    deliveryLabel: context.address.label,
                    deliveryLine1: context.address.line1,
                    deliveryLine2: context.address.line2,
                    deliveryLandmark: context.address.landmark,
                    deliveryTownship: context.address.township,
                    deliveryCity: context.address.city,
                    deliveryPostalCode: context.address.postalCode,
                    deliveryInstructions: context.address.deliveryInstructions,
                    deliveryLatitude: new client_1.Prisma.Decimal(context.address.latitude),
                    deliveryLongitude: new client_1.Prisma.Decimal(context.address.longitude),
                    changedByUserId: currentUser.userId,
                    cartItems: context.cart.items.map((item) => ({
                        menuItemId: item.menuItemId,
                        categoryId: item.categoryId ?? null,
                        nameSnapshot: item.menuItemName,
                        descriptionSnapshot: item.menuItemDescription ?? null,
                        imageUrlSnapshot: item.menuItemImageUrl ?? null,
                        unitBasePriceSnapshot: new client_1.Prisma.Decimal(item.menuItemBasePrice),
                        unitPriceSnapshot: new client_1.Prisma.Decimal(item.unitPriceSnapshot),
                        quantity: item.quantity,
                        lineTotal: new client_1.Prisma.Decimal(item.lineTotal),
                        selectedOptions: item.selectedOptions.map((selectedOption) => ({
                            itemOptionId: selectedOption.itemOptionId,
                            optionGroupId: selectedOption.optionGroupId,
                            optionGroupNameSnapshot: selectedOption.optionGroupName,
                            nameSnapshot: selectedOption.nameSnapshot,
                            priceDeltaSnapshot: new client_1.Prisma.Decimal(selectedOption.priceDeltaSnapshot),
                        })),
                    })),
                }, tx);
                await this.cartsRepository.updateCart(context.cart.cartId, {
                    status: client_1.CartStatus.CHECKED_OUT,
                }, tx);
                return {
                    order,
                    wasCreated: true,
                };
            });
            if (result.wasCreated) {
                await this.queueService.add('order-timeouts', 'start-timeout', {
                    orderId: result.order.id,
                });
                await this.systemMessageService.publishOrderEvent(currentUser, {
                    orderId: result.order.id,
                    code: 'ORDER_PLACED',
                    metadata: {
                        actorUserId: currentUser.userId,
                        orderCode: result.order.orderCode,
                    },
                    templateVariables: {
                        orderCode: result.order.orderCode,
                    },
                });
            }
            return (0, checkout_submission_entity_1.buildCheckoutSubmission)(result.order, {
                isIdempotentReplay: !result.wasCreated,
            });
        }
        catch (error) {
            const replayOrder = await this.tryResolveReplayAfterUniqueConstraint(error, context, input.idempotencyKey);
            if (replayOrder !== null) {
                return (0, checkout_submission_entity_1.buildCheckoutSubmission)(replayOrder, {
                    isIdempotentReplay: true,
                });
            }
            throw error;
        }
    }
    buildOrderCode() {
        const suffix = Date.now().toString().slice(-8);
        return `ORD-${suffix}`;
    }
    assertIdempotentOrderBelongsToCustomer(currentUser, context, customerProfileId) {
        if (!(0, checkout_customer_access_policy_helper_1.hasCheckoutCustomerAccess)({
            currentUser,
            ownerUserId: context.customer.userId,
            customerProfileId,
        }) ||
            customerProfileId !== context.customer.customerProfileId) {
            throw new app_exception_1.AppException('The provided idempotency key is already in use by another checkout request.', common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
            });
        }
    }
    async tryResolveReplayAfterUniqueConstraint(error, context, idempotencyKey) {
        if (!(error instanceof client_1.Prisma.PrismaClientKnownRequestError) ||
            error.code !== 'P2002') {
            return null;
        }
        const targets = Array.isArray(error.meta?.target) ? error.meta.target : [];
        if (!targets.includes('idempotencyKey')) {
            return null;
        }
        const existingOrder = await this.ordersRepository.findByIdempotencyKey(idempotencyKey);
        if (existingOrder === null) {
            return null;
        }
        this.assertIdempotentOrderBelongsToCustomer({
            userId: context.customer.userId,
            sessionId: 'checkout-submission-replay',
            role: context.customer.role,
            tokenType: 'access',
            actorContext: {
                userId: context.customer.userId,
                phone: context.customer.phone,
                role: context.customer.role,
                status: context.customer.userStatus,
                customerProfileId: context.customer.customerProfileId,
            },
        }, context, existingOrder.customerProfileId);
        return existingOrder;
    }
};
exports.CheckoutSubmissionService = CheckoutSubmissionService;
exports.CheckoutSubmissionService = CheckoutSubmissionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        checkout_context_service_1.CheckoutContextService,
        checkout_pricing_service_1.CheckoutPricingService,
        orders_repository_1.OrdersRepository,
        carts_repository_1.CartsRepository,
        queue_service_1.QueueService,
        system_message_service_1.SystemMessageService])
], CheckoutSubmissionService);
//# sourceMappingURL=checkout-submission.service.js.map