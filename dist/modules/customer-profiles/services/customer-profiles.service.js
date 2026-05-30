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
exports.CustomerProfilesService = void 0;
const common_1 = require("@nestjs/common");
const customer_profile_ownership_entity_1 = require("../entities/customer-profile-ownership.entity");
const customer_profiles_repository_1 = require("../repositories/customer-profiles.repository");
let CustomerProfilesService = class CustomerProfilesService {
    constructor(customerProfilesRepository) {
        this.customerProfilesRepository = customerProfilesRepository;
    }
    findById(id) {
        return this.customerProfilesRepository.findById(id);
    }
    findByUserId(userId) {
        return this.customerProfilesRepository.findByUserId(userId);
    }
    async findOwnedByUserId(userId, customerProfileId) {
        const profile = await this.findById(customerProfileId);
        if (profile === null || !this.belongsToUser(profile, userId)) {
            return null;
        }
        return profile;
    }
    buildOwnership(profile) {
        return (0, customer_profile_ownership_entity_1.buildCustomerProfileOwnership)(profile);
    }
    belongsToUser(profile, userId) {
        return profile.user.id === userId;
    }
};
exports.CustomerProfilesService = CustomerProfilesService;
exports.CustomerProfilesService = CustomerProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [customer_profiles_repository_1.CustomerProfilesRepository])
], CustomerProfilesService);
//# sourceMappingURL=customer-profiles.service.js.map