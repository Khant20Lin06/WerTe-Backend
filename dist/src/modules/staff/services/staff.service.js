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
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const password_service_1 = require("../../auth/services/password.service");
const staff_repository_1 = require("../repositories/staff.repository");
let StaffService = class StaffService {
    constructor(staffRepository, passwordService) {
        this.staffRepository = staffRepository;
        this.passwordService = passwordService;
    }
    listStaff(currentUser) {
        const merchantId = this.requireMerchantId(currentUser);
        return this.staffRepository.findByMerchantId(merchantId);
    }
    async inviteStaff(currentUser, dto) {
        const merchantId = this.requireMerchantId(currentUser);
        const passwordHash = await this.passwordService.hash(dto.password);
        try {
            return await this.staffRepository.createStaff({
                phone: dto.phone.trim(),
                passwordHash,
                displayName: dto.displayName.trim(),
                merchantId,
                role: dto.role,
                branchIds: dto.branchIds ?? [],
            });
        }
        catch (err) {
            const code = err.code;
            if (code === 'P2002') {
                throw new app_exception_1.AppException('A user with this phone number already exists.', common_1.HttpStatus.CONFLICT, { code: error_codes_1.ErrorCodes.conflict });
            }
            throw err;
        }
    }
    async updateStaff(currentUser, staffId, dto) {
        const merchantId = this.requireMerchantId(currentUser);
        await this.resolveOwnedStaff(merchantId, staffId);
        return this.staffRepository.updateStaff(staffId, {
            role: dto.role,
            status: dto.status,
            branchIds: dto.branchIds,
        });
    }
    async removeStaff(currentUser, staffId) {
        const merchantId = this.requireMerchantId(currentUser);
        await this.resolveOwnedStaff(merchantId, staffId);
        await this.staffRepository.deleteStaff(staffId);
    }
    async resolveOwnedStaff(merchantId, staffId) {
        const staff = await this.staffRepository.findByIdAndMerchant(staffId, merchantId);
        if (!staff) {
            throw new app_exception_1.AppException('Staff member not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return staff;
    }
    requireMerchantId(currentUser) {
        const merchantId = currentUser.actorContext.merchantId;
        if (!merchantId) {
            throw new app_exception_1.AppException('You do not have a merchant scope.', common_1.HttpStatus.FORBIDDEN, { code: error_codes_1.ErrorCodes.forbidden });
        }
        return merchantId;
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [staff_repository_1.StaffRepository,
        password_service_1.PasswordService])
], StaffService);
//# sourceMappingURL=staff.service.js.map