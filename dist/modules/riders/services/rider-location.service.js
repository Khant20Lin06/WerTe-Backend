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
exports.RiderLocationService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const deliveries_repository_1 = require("../../deliveries/repositories/deliveries.repository");
const riders_repository_1 = require("../repositories/riders.repository");
const rider_location_policy_helper_1 = require("../policies/rider-location-policy.helper");
const rider_account_service_1 = require("./rider-account.service");
let RiderLocationService = class RiderLocationService {
    constructor(prisma, riderAccountService, ridersRepository, deliveriesRepository) {
        this.prisma = prisma;
        this.riderAccountService = riderAccountService;
        this.ridersRepository = ridersRepository;
        this.deliveriesRepository = deliveriesRepository;
    }
    async ingestCurrentRiderLocation(currentUser, payload) {
        const rider = await this.riderAccountService.resolveOwnedRider(currentUser);
        const activeDelivery = await this.deliveriesRepository.findRiderActiveDelivery(rider.id);
        if (!(0, rider_location_policy_helper_1.canIngestRiderLocation)(rider, activeDelivery !== null)) {
            throw new app_exception_1.AppException('Rider location updates require an active rider account that is online or actively delivering an order.', common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
            });
        }
        const currentLocation = await this.ridersRepository.findCurrentLocationByRiderId(rider.id);
        const locationPayload = {
            deliveryId: activeDelivery?.id ?? null,
            latitude: payload.latitude,
            longitude: payload.longitude,
            heading: payload.heading ?? null,
            speed: payload.speed ?? null,
            accuracyMeters: payload.accuracyMeters ?? null,
            recordedAt: new Date(payload.recordedAt),
        };
        if ((0, rider_location_policy_helper_1.isDuplicateRiderLocation)(currentLocation, locationPayload)) {
            return this.toRiderLocationDto(rider.id, currentLocation, true);
        }
        const snapshot = await this.prisma.runInTransaction(async (tx) => {
            const updatedCurrentLocation = await this.ridersRepository.upsertCurrentLocation(rider.id, locationPayload, tx);
            await this.ridersRepository.createLocationHistory(rider.id, locationPayload, tx);
            return updatedCurrentLocation;
        });
        return this.toRiderLocationDto(rider.id, snapshot, false);
    }
    toRiderLocationDto(riderId, location, duplicate) {
        return {
            riderId,
            deliveryId: location.deliveryId,
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
            heading: location.heading?.toString() ?? null,
            speed: location.speed?.toString() ?? null,
            accuracyMeters: location.accuracyMeters?.toString() ?? null,
            recordedAt: location.recordedAt.toISOString(),
            duplicate,
        };
    }
};
exports.RiderLocationService = RiderLocationService;
exports.RiderLocationService = RiderLocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rider_account_service_1.RiderAccountService,
        riders_repository_1.RidersRepository,
        deliveries_repository_1.DeliveriesRepository])
], RiderLocationService);
//# sourceMappingURL=rider-location.service.js.map