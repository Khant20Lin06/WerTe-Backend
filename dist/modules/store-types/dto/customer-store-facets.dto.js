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
exports.CustomerStoreFacetsDto = exports.CustomerTownshipFacetDto = exports.CustomerStoreTypeFacetDto = void 0;
exports.toCustomerStoreFacetsDto = toCustomerStoreFacetsDto;
const swagger_1 = require("@nestjs/swagger");
class CustomerStoreTypeFacetDto {
}
exports.CustomerStoreTypeFacetDto = CustomerStoreTypeFacetDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store type identifier.',
        example: 'store_type_grocery',
    }),
    __metadata("design:type", String)
], CustomerStoreTypeFacetDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store type code.',
        example: 'grocery',
    }),
    __metadata("design:type", String)
], CustomerStoreTypeFacetDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store type display name.',
        example: 'Grocery',
    }),
    __metadata("design:type", String)
], CustomerStoreTypeFacetDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of customer-visible branches matching this store type.',
        example: 12,
    }),
    __metadata("design:type", Number)
], CustomerStoreTypeFacetDto.prototype, "count", void 0);
class CustomerTownshipFacetDto {
}
exports.CustomerTownshipFacetDto = CustomerTownshipFacetDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Township label.',
        example: 'Kamaryut',
    }),
    __metadata("design:type", String)
], CustomerTownshipFacetDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of customer-visible branches in the township.',
        example: 7,
    }),
    __metadata("design:type", Number)
], CustomerTownshipFacetDto.prototype, "count", void 0);
class CustomerStoreFacetsDto {
}
exports.CustomerStoreFacetsDto = CustomerStoreFacetsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of matching customer-visible stores.',
        example: 18,
    }),
    __metadata("design:type", Number)
], CustomerStoreFacetsDto.prototype, "totalStoreCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store type facets derived from matching stores.',
        type: CustomerStoreTypeFacetDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CustomerStoreFacetsDto.prototype, "storeTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Township facets derived from matching stores.',
        type: CustomerTownshipFacetDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], CustomerStoreFacetsDto.prototype, "townships", void 0);
function toCustomerStoreFacetsDto(branches) {
    const storeTypeMap = new Map();
    const townshipMap = new Map();
    for (const branch of branches) {
        townshipMap.set(branch.township, {
            township: branch.township,
            count: (townshipMap.get(branch.township)?.count ?? 0) + 1,
        });
        for (const assignment of branch.storeTypes) {
            const key = assignment.storeType.id;
            storeTypeMap.set(key, {
                id: assignment.storeType.id,
                code: assignment.storeType.code,
                name: assignment.storeType.name,
                count: (storeTypeMap.get(key)?.count ?? 0) + 1,
            });
        }
    }
    return {
        totalStoreCount: branches.length,
        storeTypes: [...storeTypeMap.values()].sort((left, right) => left.name.localeCompare(right.name)),
        townships: [...townshipMap.values()].sort((left, right) => left.township.localeCompare(right.township)),
    };
}
//# sourceMappingURL=customer-store-facets.dto.js.map