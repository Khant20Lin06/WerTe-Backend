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
exports.StaffRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const staff_member_dto_1 = require("../dto/staff-member.dto");
let StaffRepository = class StaffRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findByMerchantId(merchantId) {
        return this.prisma.merchantStaff.findMany({
            where: { merchantId },
            include: staff_member_dto_1.staffMemberInclude,
            orderBy: [{ role: 'asc' }, { displayName: 'asc' }],
        });
    }
    findById(staffId) {
        return this.prisma.merchantStaff.findUnique({
            where: { id: staffId },
            include: staff_member_dto_1.staffMemberInclude,
        });
    }
    findByIdAndMerchant(staffId, merchantId) {
        return this.prisma.merchantStaff.findFirst({
            where: { id: staffId, merchantId },
            include: staff_member_dto_1.staffMemberInclude,
        });
    }
    async createStaff(params) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    phone: params.phone,
                    passwordHash: params.passwordHash,
                    role: client_1.UserRole.MERCHANT_STAFF,
                },
            });
            const staff = await tx.merchantStaff.create({
                data: {
                    userId: user.id,
                    merchantId: params.merchantId,
                    role: params.role,
                    displayName: params.displayName,
                    branchAssignments: {
                        create: params.branchIds.map((branchId) => ({ branchId })),
                    },
                },
                include: staff_member_dto_1.staffMemberInclude,
            });
            return staff;
        });
    }
    async updateStaff(staffId, params) {
        return this.prisma.$transaction(async (tx) => {
            if (params.branchIds !== undefined) {
                await tx.branchStaffAssignment.deleteMany({ where: { staffId } });
            }
            return tx.merchantStaff.update({
                where: { id: staffId },
                data: {
                    ...(params.role !== undefined && { role: params.role }),
                    ...(params.status !== undefined && { status: params.status }),
                    ...(params.branchIds !== undefined && {
                        branchAssignments: {
                            create: params.branchIds.map((branchId) => ({ branchId })),
                        },
                    }),
                },
                include: staff_member_dto_1.staffMemberInclude,
            });
        });
    }
    deleteStaff(staffId) {
        return this.prisma.$transaction(async (tx) => {
            const staff = await tx.merchantStaff.findUnique({
                where: { id: staffId },
                select: { userId: true },
            });
            if (!staff)
                return;
            await tx.merchantStaff.delete({ where: { id: staffId } });
            await tx.user.delete({ where: { id: staff.userId } });
        });
    }
};
exports.StaffRepository = StaffRepository;
exports.StaffRepository = StaffRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaffRepository);
//# sourceMappingURL=staff.repository.js.map