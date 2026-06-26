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
exports.AdminCustomerManagementService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const customer_profile_dto_1 = require("../dto/customer-profile.dto");
const customer_profiles_repository_1 = require("../repositories/customer-profiles.repository");
let AdminCustomerManagementService = class AdminCustomerManagementService {
    constructor(customerProfilesRepository) {
        this.customerProfilesRepository = customerProfilesRepository;
    }
    async listCustomers(opts) {
        const profiles = await this.customerProfilesRepository.findAll(opts);
        return profiles.map(customer_profile_dto_1.toCustomerProfileDto);
    }
    async updateCustomerStatus(customerId, status) {
        const existing = await this.customerProfilesRepository.findById(customerId);
        if (existing === null) {
            throw new app_exception_1.AppException(`Customer '${customerId}' was not found.`, common_1.HttpStatus.NOT_FOUND, { code: error_codes_1.ErrorCodes.notFound });
        }
        const updated = await this.customerProfilesRepository.update(customerId, {
            user: { update: { status } },
        });
        return (0, customer_profile_dto_1.toCustomerProfileDto)(updated);
    }
};
exports.AdminCustomerManagementService = AdminCustomerManagementService;
exports.AdminCustomerManagementService = AdminCustomerManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [customer_profiles_repository_1.CustomerProfilesRepository])
], AdminCustomerManagementService);
//# sourceMappingURL=admin-customer-management.service.js.map