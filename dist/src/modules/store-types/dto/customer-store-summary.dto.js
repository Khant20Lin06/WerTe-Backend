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
exports.CustomerStoreSummaryDto = exports.CustomerStoreTypeBadgeDto = exports.CustomerStoreOperatingHoursDto = exports.CustomerStoreOperatingDayDto = void 0;
exports.toCustomerStoreSummaryDto = toCustomerStoreSummaryDto;
exports.computeIsOpenNow = computeIsOpenNow;
const swagger_1 = require("@nestjs/swagger");
class CustomerStoreOperatingDayDto {
}
exports.CustomerStoreOperatingDayDto = CustomerStoreOperatingDayDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], CustomerStoreOperatingDayDto.prototype, "open", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '09:00' }),
    __metadata("design:type", String)
], CustomerStoreOperatingDayDto.prototype, "openTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '22:00' }),
    __metadata("design:type", String)
], CustomerStoreOperatingDayDto.prototype, "closeTime", void 0);
class CustomerStoreOperatingHoursDto {
}
exports.CustomerStoreOperatingHoursDto = CustomerStoreOperatingHoursDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CustomerStoreOperatingDayDto }),
    __metadata("design:type", CustomerStoreOperatingDayDto)
], CustomerStoreOperatingHoursDto.prototype, "mon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CustomerStoreOperatingDayDto }),
    __metadata("design:type", CustomerStoreOperatingDayDto)
], CustomerStoreOperatingHoursDto.prototype, "tue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CustomerStoreOperatingDayDto }),
    __metadata("design:type", CustomerStoreOperatingDayDto)
], CustomerStoreOperatingHoursDto.prototype, "wed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CustomerStoreOperatingDayDto }),
    __metadata("design:type", CustomerStoreOperatingDayDto)
], CustomerStoreOperatingHoursDto.prototype, "thu", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CustomerStoreOperatingDayDto }),
    __metadata("design:type", CustomerStoreOperatingDayDto)
], CustomerStoreOperatingHoursDto.prototype, "fri", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CustomerStoreOperatingDayDto }),
    __metadata("design:type", CustomerStoreOperatingDayDto)
], CustomerStoreOperatingHoursDto.prototype, "sat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CustomerStoreOperatingDayDto }),
    __metadata("design:type", CustomerStoreOperatingDayDto)
], CustomerStoreOperatingHoursDto.prototype, "sun", void 0);
class CustomerStoreTypeBadgeDto {
}
exports.CustomerStoreTypeBadgeDto = CustomerStoreTypeBadgeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store type identifier.',
        example: 'store_type_grocery',
    }),
    __metadata("design:type", String)
], CustomerStoreTypeBadgeDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store type code.',
        example: 'grocery',
    }),
    __metadata("design:type", String)
], CustomerStoreTypeBadgeDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store type display name.',
        example: 'Grocery',
    }),
    __metadata("design:type", String)
], CustomerStoreTypeBadgeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Presentation sort order for the store type.',
        example: 10,
    }),
    __metadata("design:type", Number)
], CustomerStoreTypeBadgeDto.prototype, "sortOrder", void 0);
class CustomerStoreSummaryDto {
}
exports.CustomerStoreSummaryDto = CustomerStoreSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier exposed as the customer-facing store id.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], CustomerStoreSummaryDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch display name.',
        example: 'Downtown Branch',
    }),
    __metadata("design:type", String)
], CustomerStoreSummaryDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant identifier.',
        example: 'merchant_1',
    }),
    __metadata("design:type", String)
], CustomerStoreSummaryDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant display name.',
        example: 'Tea House',
    }),
    __metadata("design:type", String)
], CustomerStoreSummaryDto.prototype, "merchantName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer-visible township label.',
        example: 'Kamaryut',
    }),
    __metadata("design:type", String)
], CustomerStoreSummaryDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Primary approved store type for the branch.',
        type: CustomerStoreTypeBadgeDto,
    }),
    __metadata("design:type", CustomerStoreTypeBadgeDto)
], CustomerStoreSummaryDto.prototype, "primaryStoreType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'All approved active store types visible to customers for the branch.',
        type: CustomerStoreTypeBadgeDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CustomerStoreSummaryDto.prototype, "approvedStoreTypes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Average rating score for the branch (1-5). Null when no ratings exist.',
        example: 4.5,
        nullable: true,
    }),
    __metadata("design:type", Object)
], CustomerStoreSummaryDto.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of ratings for the branch.',
        example: 12,
    }),
    __metadata("design:type", Number)
], CustomerStoreSummaryDto.prototype, "reviewCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the branch is currently open based on its operating hours.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CustomerStoreSummaryDto.prototype, "isOpenNow", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Operating hours per day of week. Null if not configured.',
        type: CustomerStoreOperatingHoursDto,
        nullable: true,
    }),
    __metadata("design:type", Object)
], CustomerStoreSummaryDto.prototype, "operatingHours", void 0);
function toCustomerStoreSummaryDto(branch, options) {
    const approvedStoreTypes = branch.storeTypes.map((assignment) => ({
        id: assignment.storeType.id,
        code: assignment.storeType.code,
        name: assignment.storeType.name,
        sortOrder: assignment.storeType.sortOrder,
    }));
    const preferredStoreTypeCodeSet = new Set((options?.preferredStoreTypeCodes ?? []).map((code) => code.toLowerCase()));
    const primaryStoreType = approvedStoreTypes.find((storeType) => preferredStoreTypeCodeSet.has(storeType.code.toLowerCase())) ?? approvedStoreTypes[0];
    const operatingHours = branch.operatingHours;
    return {
        branchId: branch.id,
        branchName: branch.name,
        merchantId: branch.merchant.id,
        merchantName: branch.merchant.name,
        township: branch.township,
        primaryStoreType,
        approvedStoreTypes,
        averageRating: options?.averageRating ?? null,
        reviewCount: options?.reviewCount ?? 0,
        isOpenNow: computeIsOpenNow(operatingHours),
        operatingHours,
    };
}
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
function computeIsOpenNow(hours) {
    if (!hours)
        return true;
    const now = new Date();
    const dayKey = DAY_KEYS[now.getDay()];
    const day = hours[dayKey];
    if (!day || !day.open)
        return false;
    if (!day.openTime || !day.closeTime)
        return true;
    const pad = (n) => String(n).padStart(2, '0');
    const current = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    return current >= day.openTime && current <= day.closeTime;
}
//# sourceMappingURL=customer-store-summary.dto.js.map