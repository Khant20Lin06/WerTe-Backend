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
exports.RidersRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const rider_ownership_entity_1 = require("../entities/rider-ownership.entity");
let RidersRepository = class RidersRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findById(id) {
        return this.prisma.rider.findUnique({
            where: { id },
            include: rider_ownership_entity_1.riderOwnershipInclude,
        });
    }
    findByUserId(userId) {
        return this.prisma.rider.findUnique({
            where: { userId },
            include: rider_ownership_entity_1.riderOwnershipInclude,
        });
    }
    findEligibleRiders(options) {
        return this.prisma.rider.findMany({
            where: {
                status: client_1.RiderStatus.ACTIVE,
                user: { status: client_1.UserStatus.ACTIVE },
                availability: {
                    isOnline: true,
                    isAvailable: true,
                },
                deliveries: {
                    none: {
                        status: { in: ['ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'] },
                    },
                },
                ...(options?.township
                    ? { currentTownship: options.township }
                    : {}),
            },
            include: rider_ownership_entity_1.riderOwnershipInclude,
            orderBy: [
                { availability: { lastStatusChangedAt: 'asc' } },
                { id: 'asc' },
            ],
        });
    }
    update(id, data, client = this.prisma) {
        return client.rider.update({
            where: { id },
            data,
            include: rider_ownership_entity_1.riderOwnershipInclude,
        });
    }
    upsertAvailability(riderId, data, client = this.prisma) {
        return client.rider.update({
            where: { id: riderId },
            data: {
                availability: {
                    upsert: {
                        create: {
                            isOnline: data.isOnline,
                            isAvailable: data.isAvailable,
                            lastStatusChangedAt: data.lastStatusChangedAt,
                        },
                        update: {
                            isOnline: data.isOnline,
                            isAvailable: data.isAvailable,
                            lastStatusChangedAt: data.lastStatusChangedAt,
                        },
                    },
                },
            },
            include: rider_ownership_entity_1.riderOwnershipInclude,
        });
    }
    findCurrentLocationByRiderId(riderId, client = this.prisma) {
        return client.riderCurrentLocation.findUnique({
            where: {
                riderId,
            },
        });
    }
    upsertCurrentLocation(riderId, data, client = this.prisma) {
        return client.riderCurrentLocation.upsert({
            where: {
                riderId,
            },
            create: {
                riderId,
                deliveryId: data.deliveryId,
                latitude: data.latitude,
                longitude: data.longitude,
                heading: data.heading ?? null,
                speed: data.speed ?? null,
                accuracyMeters: data.accuracyMeters ?? null,
                recordedAt: data.recordedAt,
            },
            update: {
                deliveryId: data.deliveryId,
                latitude: data.latitude,
                longitude: data.longitude,
                heading: data.heading ?? null,
                speed: data.speed ?? null,
                accuracyMeters: data.accuracyMeters ?? null,
                recordedAt: data.recordedAt,
            },
        });
    }
    createLocationHistory(riderId, data, client = this.prisma) {
        return client.riderLocationHistory.create({
            data: {
                riderId,
                deliveryId: data.deliveryId,
                latitude: data.latitude,
                longitude: data.longitude,
                heading: data.heading ?? null,
                speed: data.speed ?? null,
                accuracyMeters: data.accuracyMeters ?? null,
                recordedAt: data.recordedAt,
            },
        });
    }
};
exports.RidersRepository = RidersRepository;
exports.RidersRepository = RidersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RidersRepository);
//# sourceMappingURL=riders.repository.js.map