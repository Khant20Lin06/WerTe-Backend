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
exports.RiderAvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const rider_availability_dto_1 = require("../dto/rider-availability.dto");
const riders_repository_1 = require("../repositories/riders.repository");
const rider_account_service_1 = require("./rider-account.service");
let RiderAvailabilityService = class RiderAvailabilityService {
    constructor(riderAccountService, ridersRepository) {
        this.riderAccountService = riderAccountService;
        this.ridersRepository = ridersRepository;
    }
    async getCurrentAvailability(currentUser) {
        const rider = await this.riderAccountService.resolveOwnedRider(currentUser);
        return (0, rider_availability_dto_1.toRiderAvailabilityDto)(rider);
    }
    async markCurrentRiderOnline(currentUser) {
        const rider = await this.riderAccountService.resolveOwnedRider(currentUser);
        this.assertCanGoOnline(rider);
        if (rider.availability?.isOnline === true &&
            rider.availability?.isAvailable === true) {
            return (0, rider_availability_dto_1.toRiderAvailabilityDto)(rider);
        }
        const updatedRider = await this.ridersRepository.upsertAvailability(rider.id, {
            isOnline: true,
            isAvailable: true,
            lastStatusChangedAt: new Date(),
        });
        return (0, rider_availability_dto_1.toRiderAvailabilityDto)(updatedRider);
    }
    async markCurrentRiderOffline(currentUser) {
        const rider = await this.riderAccountService.resolveOwnedRider(currentUser);
        if (rider.availability?.isOnline === false &&
            rider.availability?.isAvailable === false) {
            return (0, rider_availability_dto_1.toRiderAvailabilityDto)(rider);
        }
        const updatedRider = await this.ridersRepository.upsertAvailability(rider.id, {
            isOnline: false,
            isAvailable: false,
            lastStatusChangedAt: new Date(),
        });
        return (0, rider_availability_dto_1.toRiderAvailabilityDto)(updatedRider);
    }
    assertCanGoOnline(rider) {
        if (rider.user.status !== client_1.UserStatus.ACTIVE || rider.status !== client_1.RiderStatus.ACTIVE) {
            throw new app_exception_1.AppException('Only active rider accounts can go online for dispatch.', common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
            });
        }
    }
};
exports.RiderAvailabilityService = RiderAvailabilityService;
exports.RiderAvailabilityService = RiderAvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rider_account_service_1.RiderAccountService,
        riders_repository_1.RidersRepository])
], RiderAvailabilityService);
//# sourceMappingURL=rider-availability.service.js.map