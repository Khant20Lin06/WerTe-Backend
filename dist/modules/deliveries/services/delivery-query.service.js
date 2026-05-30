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
exports.DeliveryQueryService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const delivery_detail_entity_1 = require("../entities/delivery-detail.entity");
const deliveries_repository_1 = require("../repositories/deliveries.repository");
let DeliveryQueryService = class DeliveryQueryService {
    constructor(deliveriesRepository) {
        this.deliveriesRepository = deliveriesRepository;
    }
    buildDeliveryDetail(delivery) {
        return (0, delivery_detail_entity_1.buildDeliveryDetail)(delivery);
    }
    async getDeliveryDetail(deliveryId) {
        const delivery = await this.deliveriesRepository.findById(deliveryId);
        return this.mapRequiredDelivery(delivery);
    }
    async getOrderDeliveryDetail(orderId) {
        const delivery = await this.deliveriesRepository.findByOrderId(orderId);
        return this.mapRequiredDelivery(delivery);
    }
    async getRiderActiveDelivery(currentUser) {
        const riderId = this.requireRiderId(currentUser);
        const delivery = await this.deliveriesRepository.findRiderActiveDelivery(riderId);
        return delivery === null ? null : this.buildDeliveryDetail(delivery);
    }
    async getRiderDeliveryDetail(currentUser, deliveryId) {
        const riderId = this.requireRiderId(currentUser);
        const delivery = await this.deliveriesRepository.findRiderDeliveryById(deliveryId, riderId);
        return this.mapRequiredDelivery(delivery);
    }
    mapRequiredDelivery(delivery) {
        if (delivery === null) {
            throw new app_exception_1.AppException('Delivery was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return this.buildDeliveryDetail(delivery);
    }
    requireRiderId(currentUser) {
        const riderId = currentUser.actorContext.riderId;
        if (riderId === undefined) {
            throw new app_exception_1.AppException('The authenticated actor does not have a rider scope.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return riderId;
    }
};
exports.DeliveryQueryService = DeliveryQueryService;
exports.DeliveryQueryService = DeliveryQueryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [deliveries_repository_1.DeliveriesRepository])
], DeliveryQueryService);
//# sourceMappingURL=delivery-query.service.js.map