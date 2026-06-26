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
exports.CustomerStoreCatalogEntryDto = void 0;
exports.toCustomerStoreCatalogEntryDto = toCustomerStoreCatalogEntryDto;
const swagger_1 = require("@nestjs/swagger");
const branch_catalog_dto_1 = require("../../menus/dto/branch-catalog.dto");
const customer_store_detail_dto_1 = require("./customer-store-detail.dto");
class CustomerStoreCatalogEntryDto {
}
exports.CustomerStoreCatalogEntryDto = CustomerStoreCatalogEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer-visible store detail metadata.',
        type: customer_store_detail_dto_1.CustomerStoreDetailDto,
    }),
    __metadata("design:type", customer_store_detail_dto_1.CustomerStoreDetailDto)
], CustomerStoreCatalogEntryDto.prototype, "store", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Selected catalog entry for the chosen store type.',
        type: customer_store_detail_dto_1.CustomerStoreCatalogEntrySummaryDto,
    }),
    __metadata("design:type", customer_store_detail_dto_1.CustomerStoreCatalogEntrySummaryDto)
], CustomerStoreCatalogEntryDto.prototype, "selectedCatalogEntry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer-visible catalog for the selected store-type entry.',
        type: branch_catalog_dto_1.BranchCatalogDto,
    }),
    __metadata("design:type", branch_catalog_dto_1.BranchCatalogDto)
], CustomerStoreCatalogEntryDto.prototype, "catalog", void 0);
function toCustomerStoreCatalogEntryDto(branch, catalog, selectedCatalogEntry) {
    return {
        store: (0, customer_store_detail_dto_1.toCustomerStoreDetailDto)(branch, catalog),
        selectedCatalogEntry,
        catalog: (0, branch_catalog_dto_1.toBranchCatalogDto)(catalog),
    };
}
//# sourceMappingURL=customer-store-catalog-entry.dto.js.map