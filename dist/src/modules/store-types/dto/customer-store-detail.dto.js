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
exports.CustomerStoreDetailDto = exports.CustomerStoreCatalogEntrySummaryDto = void 0;
exports.toCustomerStoreDetailDto = toCustomerStoreDetailDto;
const swagger_1 = require("@nestjs/swagger");
const customer_store_summary_dto_1 = require("./customer-store-summary.dto");
class CustomerStoreCatalogEntrySummaryDto {
}
exports.CustomerStoreCatalogEntrySummaryDto = CustomerStoreCatalogEntrySummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store type metadata for the catalog entry.',
        type: customer_store_summary_dto_1.CustomerStoreTypeBadgeDto,
    }),
    __metadata("design:type", customer_store_summary_dto_1.CustomerStoreTypeBadgeDto)
], CustomerStoreCatalogEntrySummaryDto.prototype, "storeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this catalog entry is the branch primary entry.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CustomerStoreCatalogEntrySummaryDto.prototype, "isPrimary", void 0);
class CustomerStoreDetailDto {
}
exports.CustomerStoreDetailDto = CustomerStoreDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch identifier exposed as the customer-facing store id.',
        example: 'branch_1',
    }),
    __metadata("design:type", String)
], CustomerStoreDetailDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch display name.',
        example: 'Downtown Branch',
    }),
    __metadata("design:type", String)
], CustomerStoreDetailDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant identifier.',
        example: 'merchant_1',
    }),
    __metadata("design:type", String)
], CustomerStoreDetailDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Merchant display name.',
        example: 'City Mart',
    }),
    __metadata("design:type", String)
], CustomerStoreDetailDto.prototype, "merchantName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional branch contact phone.',
        example: '0942000000',
    }),
    __metadata("design:type", Object)
], CustomerStoreDetailDto.prototype, "contactPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional first-line branch address.',
        example: 'No. 10, Merchant Street',
    }),
    __metadata("design:type", Object)
], CustomerStoreDetailDto.prototype, "line1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer-visible township label.',
        example: 'Kamaryut',
    }),
    __metadata("design:type", String)
], CustomerStoreDetailDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch latitude serialized as string when available.',
        example: '16.8257',
    }),
    __metadata("design:type", Object)
], CustomerStoreDetailDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Branch longitude serialized as string when available.',
        example: '96.1421',
    }),
    __metadata("design:type", Object)
], CustomerStoreDetailDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current branch status.',
        example: 'ACTIVE',
    }),
    __metadata("design:type", String)
], CustomerStoreDetailDto.prototype, "branchStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Primary approved store type for the branch.',
        type: customer_store_summary_dto_1.CustomerStoreTypeBadgeDto,
    }),
    __metadata("design:type", customer_store_summary_dto_1.CustomerStoreTypeBadgeDto)
], CustomerStoreDetailDto.prototype, "primaryStoreType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'All approved active store types visible to customers for the branch.',
        type: customer_store_summary_dto_1.CustomerStoreTypeBadgeDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CustomerStoreDetailDto.prototype, "approvedStoreTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store-type-specific customer catalog entries available for the branch.',
        type: CustomerStoreCatalogEntrySummaryDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CustomerStoreDetailDto.prototype, "catalogEntries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of visible active catalog categories in the branch.',
        example: 4,
    }),
    __metadata("design:type", Number)
], CustomerStoreDetailDto.prototype, "visibleCategoryCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of visible active catalog items in the branch.',
        example: 18,
    }),
    __metadata("design:type", Number)
], CustomerStoreDetailDto.prototype, "visibleItemCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Average rating score for the branch (1-5). Null when no ratings exist.',
        example: 4.5,
        nullable: true,
    }),
    __metadata("design:type", Object)
], CustomerStoreDetailDto.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of ratings for the branch.',
        example: 12,
    }),
    __metadata("design:type", Number)
], CustomerStoreDetailDto.prototype, "reviewCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the branch is currently open based on its operating hours.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], CustomerStoreDetailDto.prototype, "isOpenNow", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Operating hours per day of week. Null if not configured.',
        type: customer_store_summary_dto_1.CustomerStoreOperatingHoursDto,
        nullable: true,
    }),
    __metadata("design:type", Object)
], CustomerStoreDetailDto.prototype, "operatingHours", void 0);
function toCustomerStoreDetailDto(branch, catalog, ratingAggregate) {
    const approvedStoreTypes = branch.storeTypes.map((assignment) => ({
        id: assignment.storeType.id,
        code: assignment.storeType.code,
        name: assignment.storeType.name,
        sortOrder: assignment.storeType.sortOrder,
    }));
    const catalogEntries = branch.storeTypes.map((assignment) => ({
        storeType: {
            id: assignment.storeType.id,
            code: assignment.storeType.code,
            name: assignment.storeType.name,
            sortOrder: assignment.storeType.sortOrder,
        },
        isPrimary: assignment.isPrimary,
    }));
    const visibleItemCount = catalog.uncategorizedItems.length +
        catalog.categories.reduce((total, category) => total + category.items.length, 0);
    const operatingHours = branch.operatingHours;
    return {
        branchId: branch.id,
        branchName: branch.name,
        merchantId: branch.merchant.id,
        merchantName: branch.merchant.name,
        contactPhone: branch.contactPhone,
        line1: branch.line1,
        township: branch.township,
        latitude: branch.latitude?.toString() ?? null,
        longitude: branch.longitude?.toString() ?? null,
        branchStatus: branch.status,
        primaryStoreType: approvedStoreTypes[0],
        approvedStoreTypes,
        catalogEntries,
        visibleCategoryCount: catalog.categories.length,
        visibleItemCount,
        averageRating: ratingAggregate?.averageRating ?? null,
        reviewCount: ratingAggregate?.reviewCount ?? 0,
        isOpenNow: (0, customer_store_summary_dto_1.computeIsOpenNow)(operatingHours),
        operatingHours,
    };
}
//# sourceMappingURL=customer-store-detail.dto.js.map