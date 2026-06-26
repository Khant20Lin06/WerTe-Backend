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
exports.AdminRiderManagementService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const rider_ownership_entity_1 = require("../entities/rider-ownership.entity");
const rider_profile_dto_1 = require("../dto/rider-profile.dto");
let AdminRiderManagementService = class AdminRiderManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listRiders(status) {
        const where = status ? { status } : {};
        const riders = await this.prisma.rider.findMany({
            where,
            include: rider_ownership_entity_1.riderOwnershipInclude,
            orderBy: { createdAt: 'desc' },
        });
        return riders.map(rider_profile_dto_1.toRiderProfileDto);
    }
    async updateRiderStatus(riderId, status) {
        const existing = await this.prisma.rider.findUnique({
            where: { id: riderId },
            include: rider_ownership_entity_1.riderOwnershipInclude,
        });
        if (existing === null) {
            throw new app_exception_1.AppException(`Rider '${riderId}' was not found.`, common_1.HttpStatus.NOT_FOUND, { code: error_codes_1.ErrorCodes.notFound });
        }
        const updated = await this.prisma.rider.update({
            where: { id: riderId },
            data: { status },
            include: rider_ownership_entity_1.riderOwnershipInclude,
        });
        return (0, rider_profile_dto_1.toRiderProfileDto)(updated);
    }
};
exports.AdminRiderManagementService = AdminRiderManagementService;
exports.AdminRiderManagementService = AdminRiderManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminRiderManagementService);
//# sourceMappingURL=admin-rider-management.service.js.map