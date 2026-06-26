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
exports.ApiPropertyOptionalString = exports.StaffMemberListDto = exports.StaffMemberDto = exports.staffMemberInclude = void 0;
exports.toStaffMemberDto = toStaffMemberDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
exports.staffMemberInclude = client_2.Prisma.validator()({
    user: { select: { phone: true } },
    branchAssignments: { select: { branchId: true } },
});
class StaffMemberDto {
}
exports.StaffMemberDto = StaffMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'staff_1' }),
    __metadata("design:type", String)
], StaffMemberDto.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'usr_2' }),
    __metadata("design:type", String)
], StaffMemberDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09420000001' }),
    __metadata("design:type", String)
], StaffMemberDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ko Aung' }),
    __metadata("design:type", String)
], StaffMemberDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.MerchantStaffRole }),
    __metadata("design:type", String)
], StaffMemberDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.StaffStatus }),
    __metadata("design:type", String)
], StaffMemberDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], StaffMemberDto.prototype, "branchIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], StaffMemberDto.prototype, "createdAt", void 0);
function toStaffMemberDto(record) {
    return {
        staffId: record.id,
        userId: record.userId,
        phone: record.user.phone,
        displayName: record.displayName,
        role: record.role,
        status: record.status,
        branchIds: record.branchAssignments.map((a) => a.branchId),
        createdAt: record.createdAt.toISOString(),
    };
}
class StaffMemberListDto {
}
exports.StaffMemberListDto = StaffMemberListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [StaffMemberDto] }),
    __metadata("design:type", Array)
], StaffMemberListDto.prototype, "staff", void 0);
class ApiPropertyOptionalString {
}
exports.ApiPropertyOptionalString = ApiPropertyOptionalString;
//# sourceMappingURL=staff-member.dto.js.map