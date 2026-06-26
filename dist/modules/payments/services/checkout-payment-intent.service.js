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
exports.CheckoutPaymentIntentService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const checkout_payment_intent_entity_1 = require("../entities/checkout-payment-intent.entity");
const payments_repository_1 = require("../repositories/payments.repository");
let CheckoutPaymentIntentService = class CheckoutPaymentIntentService {
    constructor(paymentsRepository) {
        this.paymentsRepository = paymentsRepository;
    }
    async findByIdempotencyKey(idempotencyKey, client) {
        const payment = await this.paymentsRepository.findCheckoutPaymentIntentByIdempotencyKey(idempotencyKey, client);
        return payment === null ? null : (0, checkout_payment_intent_entity_1.buildCheckoutPaymentIntentEntity)(payment);
    }
    async createCheckoutPaymentIntent(input, client) {
        const profile = this.resolvePaymentProfile(input.paymentMethod, input.paymentProvider);
        const payment = await this.paymentsRepository.createCheckoutPaymentIntent({
            orderId: input.orderId,
            customerProfileId: input.customerProfileId,
            method: profile.method,
            provider: profile.provider,
            status: profile.status,
            amount: input.amount,
            currencyCode: input.currencyCode,
            idempotencyKey: input.idempotencyKey,
            requiresActionAt: profile.requiresActionAt,
            metadataJson: {
                initiatedFrom: 'checkout',
                orderCode: input.orderCode,
            },
            requestPayloadJson: {
                initiatedFrom: 'checkout',
                orderCode: input.orderCode,
                method: profile.method,
                provider: profile.provider,
                amount: input.amount.toString(),
                currencyCode: input.currencyCode,
            },
            responsePayloadJson: profile.status === client_1.PaymentStatus.REQUIRES_ACTION
                ? {
                    nextAction: 'provider_confirmation_pending',
                }
                : {
                    nextAction: 'await_collection',
                },
        }, client);
        return (0, checkout_payment_intent_entity_1.buildCheckoutPaymentIntentEntity)(payment);
    }
    resolvePaymentProfile(paymentMethod, paymentProvider) {
        const method = paymentMethod ?? client_1.PaymentMethod.CASH_ON_DELIVERY;
        switch (method) {
            case client_1.PaymentMethod.CASH_ON_DELIVERY:
                if (paymentProvider !== undefined &&
                    paymentProvider !== client_1.PaymentProvider.COD) {
                    throw new app_exception_1.AppException('Cash on delivery checkouts must use the COD payment provider.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                        code: error_codes_1.ErrorCodes.unprocessableEntity,
                    });
                }
                return {
                    method,
                    provider: client_1.PaymentProvider.COD,
                    status: client_1.PaymentStatus.PENDING,
                    requiresActionAt: null,
                };
            case client_1.PaymentMethod.MANUAL:
                if (paymentProvider !== undefined &&
                    paymentProvider !== client_1.PaymentProvider.MANUAL) {
                    throw new app_exception_1.AppException('Manual payments must use the MANUAL payment provider.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                        code: error_codes_1.ErrorCodes.unprocessableEntity,
                    });
                }
                return {
                    method,
                    provider: client_1.PaymentProvider.MANUAL,
                    status: client_1.PaymentStatus.PENDING,
                    requiresActionAt: null,
                };
            case client_1.PaymentMethod.CARD:
            case client_1.PaymentMethod.DIGITAL_WALLET:
            case client_1.PaymentMethod.BANK_TRANSFER: {
                if (paymentProvider === client_1.PaymentProvider.COD) {
                    throw new app_exception_1.AppException('Non-cash checkout payments cannot use the COD provider.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                        code: error_codes_1.ErrorCodes.unprocessableEntity,
                    });
                }
                return {
                    method,
                    provider: paymentProvider ?? client_1.PaymentProvider.MANUAL,
                    status: client_1.PaymentStatus.REQUIRES_ACTION,
                    requiresActionAt: new Date(),
                };
            }
        }
    }
};
exports.CheckoutPaymentIntentService = CheckoutPaymentIntentService;
exports.CheckoutPaymentIntentService = CheckoutPaymentIntentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payments_repository_1.PaymentsRepository])
], CheckoutPaymentIntentService);
//# sourceMappingURL=checkout-payment-intent.service.js.map