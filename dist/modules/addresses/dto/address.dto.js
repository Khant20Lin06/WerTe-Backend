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
exports.AddressDto = void 0;
exports.toAddressDto = toAddressDto;
const swagger_1 = require("@nestjs/swagger");
class AddressDto {
}
exports.AddressDto = AddressDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Address identifier.',
        example: 'addr_1',
    }),
    __metadata("design:type", String)
], AddressDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer-facing address label.',
        example: 'Home',
    }),
    __metadata("design:type", String)
], AddressDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Primary address line.',
        example: 'No. 1, Main Road',
    }),
    __metadata("design:type", String)
], AddressDto.prototype, "line1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Secondary address line.',
        example: 'Apartment 5B',
    }),
    __metadata("design:type", Object)
], AddressDto.prototype, "line2", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nearby landmark to help riders locate the customer.',
        example: 'Near City Mart',
    }),
    __metadata("design:type", Object)
], AddressDto.prototype, "landmark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Township or local delivery zone label.',
        example: 'Thingangyun',
    }),
    __metadata("design:type", String)
], AddressDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'City name.',
        example: 'Yangon',
    }),
    __metadata("design:type", Object)
], AddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Postal code for the address.',
        example: '11071',
    }),
    __metadata("design:type", Object)
], AddressDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional rider instructions.',
        example: 'Call when arriving at the gate.',
    }),
    __metadata("design:type", Object)
], AddressDto.prototype, "deliveryInstructions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this address is the default checkout address.',
        example: true,
    }),
    __metadata("design:type", Boolean)
], AddressDto.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Latitude coordinate serialized as string.',
        example: '16.834',
    }),
    __metadata("design:type", String)
], AddressDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Longitude coordinate serialized as string.',
        example: '96.176',
    }),
    __metadata("design:type", String)
], AddressDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Address creation timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], AddressDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Address last update timestamp.',
        example: '2026-04-19T08:00:00.000Z',
    }),
    __metadata("design:type", String)
], AddressDto.prototype, "updatedAt", void 0);
function toAddressDto(address) {
    return {
        id: address.id,
        label: address.label,
        line1: address.line1,
        line2: address.line2,
        landmark: address.landmark,
        township: address.township,
        city: address.city,
        postalCode: address.postalCode,
        deliveryInstructions: address.deliveryInstructions,
        isDefault: address.isDefault,
        latitude: address.latitude.toString(),
        longitude: address.longitude.toString(),
        createdAt: address.createdAt.toISOString(),
        updatedAt: address.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=address.dto.js.map