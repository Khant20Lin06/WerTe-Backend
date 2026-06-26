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
exports.CustomerProfileAccountService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const customer_profile_policy_service_1 = require("../policies/customer-profile-policy.service");
const customer_profiles_repository_1 = require("../repositories/customer-profiles.repository");
const customer_profile_dto_1 = require("../dto/customer-profile.dto");
const customer_profiles_service_1 = require("./customer-profiles.service");
let CustomerProfileAccountService = class CustomerProfileAccountService {
    constructor(customerProfilesService, customerProfilesRepository, customerProfilePolicyService) {
        this.customerProfilesService = customerProfilesService;
        this.customerProfilesRepository = customerProfilesRepository;
        this.customerProfilePolicyService = customerProfilePolicyService;
    }
    async getCurrentProfile(currentUser) {
        const profile = await this.resolveOwnedProfile(currentUser);
        return (0, customer_profile_dto_1.toCustomerProfileDto)(profile);
    }
    async updateCurrentProfile(currentUser, payload) {
        const profile = await this.resolveOwnedProfile(currentUser);
        const updatedProfile = await this.customerProfilesRepository.update(profile.id, {
            ...(payload.fullName !== undefined ? { fullName: payload.fullName } : {}),
            ...(payload.avatarUrl !== undefined
                ? { avatarUrl: payload.avatarUrl }
                : {}),
        });
        return (0, customer_profile_dto_1.toCustomerProfileDto)(updatedProfile);
    }
    async resolveOwnedProfile(currentUser) {
        const actorCustomerProfileId = currentUser.actorContext.customerProfileId;
        const profile = actorCustomerProfileId !== undefined
            ? await this.customerProfilesService.findOwnedByUserId(currentUser.userId, actorCustomerProfileId)
            : await this.customerProfilesService.findByUserId(currentUser.userId);
        if (profile === null) {
            throw new app_exception_1.AppException('Customer profile was not found for the authenticated user.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.customerProfilePolicyService.canAccessProfile(currentUser, profile)) {
            throw new app_exception_1.AppException('You are not allowed to access this customer profile.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return profile;
    }
};
exports.CustomerProfileAccountService = CustomerProfileAccountService;
exports.CustomerProfileAccountService = CustomerProfileAccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [customer_profiles_service_1.CustomerProfilesService,
        customer_profiles_repository_1.CustomerProfilesRepository,
        customer_profile_policy_service_1.CustomerProfilePolicyService])
], CustomerProfileAccountService);
//# sourceMappingURL=customer-profile-account.service.js.map