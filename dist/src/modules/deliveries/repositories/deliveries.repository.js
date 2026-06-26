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
exports.DeliveriesRepository = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const delivery_detail_entity_1 = require("../entities/delivery-detail.entity");
const ACTIVE_DELIVERY_STATUSES = [
    client_1.DeliveryStatus.ASSIGNED,
    client_1.DeliveryStatus.ACCEPTED,
    client_1.DeliveryStatus.PICKED_UP,
    client_1.DeliveryStatus.ON_THE_WAY,
];
let DeliveriesRepository = class DeliveriesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findById(deliveryId, client = this.prisma) {
        return client.delivery.findUnique({
            where: {
                id: deliveryId,
            },
            include: delivery_detail_entity_1.deliveryDetailInclude,
        });
    }
    findByOrderId(orderId, client = this.prisma) {
        return client.delivery.findUnique({
            where: {
                orderId,
            },
            include: delivery_detail_entity_1.deliveryDetailInclude,
        });
    }
    findRiderActiveDelivery(riderId) {
        return this.prisma.delivery.findFirst({
            where: {
                riderId,
                status: {
                    in: ACTIVE_DELIVERY_STATUSES,
                },
            },
            include: delivery_detail_entity_1.deliveryDetailInclude,
            orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        });
    }
    findRiderDeliveryById(deliveryId, riderId, client = this.prisma) {
        return client.delivery.findFirst({
            where: {
                id: deliveryId,
                riderId,
            },
            include: delivery_detail_entity_1.deliveryDetailInclude,
        });
    }
    updateById(deliveryId, data, client = this.prisma) {
        return client.delivery.update({
            where: {
                id: deliveryId,
            },
            data,
            include: delivery_detail_entity_1.deliveryDetailInclude,
        });
    }
    upsertAssignedDelivery(orderId, payload, client = this.prisma) {
        return client.delivery.upsert({
            where: {
                orderId,
            },
            create: {
                orderId,
                riderId: payload.riderId,
                status: client_1.DeliveryStatus.ASSIGNED,
                etaMinutes: payload.etaMinutes,
                assignedAt: payload.assignedAt,
            },
            update: {
                riderId: payload.riderId,
                status: client_1.DeliveryStatus.ASSIGNED,
                etaMinutes: payload.etaMinutes,
                assignedAt: payload.assignedAt,
                acceptedAt: null,
                pickedUpAt: null,
                onTheWayAt: null,
                deliveredAt: null,
                failedAt: null,
                cancelledAt: null,
                failureReasonCode: null,
                failureNote: null,
            },
            include: delivery_detail_entity_1.deliveryDetailInclude,
        });
    }
};
exports.DeliveriesRepository = DeliveriesRepository;
exports.DeliveriesRepository = DeliveriesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeliveriesRepository);
//# sourceMappingURL=deliveries.repository.js.map