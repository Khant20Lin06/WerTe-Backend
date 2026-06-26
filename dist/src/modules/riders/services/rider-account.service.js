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
exports.RiderAccountService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const rider_operational_summary_dto_1 = require("../dto/rider-operational-summary.dto");
const rider_profile_dto_1 = require("../dto/rider-profile.dto");
const rider_policy_service_1 = require("../policies/rider-policy.service");
const riders_repository_1 = require("../repositories/riders.repository");
const riders_service_1 = require("./riders.service");
let RiderAccountService = class RiderAccountService {
    constructor(ridersService, ridersRepository, riderPolicyService) {
        this.ridersService = ridersService;
        this.ridersRepository = ridersRepository;
        this.riderPolicyService = riderPolicyService;
    }
    async getCurrentRiderProfile(currentUser) {
        const rider = await this.resolveOwnedRider(currentUser);
        return (0, rider_profile_dto_1.toRiderProfileDto)(rider);
    }
    async updateCurrentRiderProfile(currentUser, payload) {
        const rider = await this.resolveOwnedRider(currentUser);
        const updatedRider = await this.ridersRepository.update(rider.id, {
            ...(payload.displayName !== undefined
                ? { displayName: payload.displayName }
                : {}),
            ...(payload.vehicleType !== undefined
                ? { vehicleType: payload.vehicleType }
                : {}),
            ...(payload.currentTownship !== undefined
                ? { currentTownship: payload.currentTownship }
                : {}),
        });
        return (0, rider_profile_dto_1.toRiderProfileDto)(updatedRider);
    }
    async getOperationalSummary(currentUser) {
        const rider = await this.resolveOwnedRider(currentUser);
        return (0, rider_operational_summary_dto_1.toRiderOperationalSummaryDto)(rider);
    }
    async resolveOwnedRider(currentUser) {
        const actorRiderId = currentUser.actorContext.riderId;
        const rider = actorRiderId !== undefined
            ? await this.ridersService.findOwnedByUserId(currentUser.userId, actorRiderId)
            : await this.ridersService.findByUserId(currentUser.userId);
        if (rider === null) {
            throw new app_exception_1.AppException('Rider profile was not found for the authenticated user.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (rider.status === client_1.RiderStatus.PENDING) {
            throw new app_exception_1.AppException('Your rider account is pending admin approval.', common_1.HttpStatus.FORBIDDEN, { code: error_codes_1.ErrorCodes.accountPending });
        }
        if (rider.status === client_1.RiderStatus.SUSPENDED) {
            throw new app_exception_1.AppException('Your rider account has been suspended.', common_1.HttpStatus.FORBIDDEN, { code: error_codes_1.ErrorCodes.accountSuspended });
        }
        if (!this.riderPolicyService.canAccessRider(currentUser, rider)) {
            throw new app_exception_1.AppException('You are not allowed to access this rider profile.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return rider;
    }
};
exports.RiderAccountService = RiderAccountService;
exports.RiderAccountService = RiderAccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [riders_service_1.RidersService,
        riders_repository_1.RidersRepository,
        rider_policy_service_1.RiderPolicyService])
], RiderAccountService);
//# sourceMappingURL=rider-account.service.js.map