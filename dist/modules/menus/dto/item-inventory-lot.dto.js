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
exports.ItemInventoryLotDto = void 0;
exports.toItemInventoryLotDto = toItemInventoryLotDto;
const swagger_1 = require("@nestjs/swagger");
class ItemInventoryLotDto {
}
exports.ItemInventoryLotDto = ItemInventoryLotDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'lot_1' }),
    __metadata("design:type", String)
], ItemInventoryLotDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'item_1' }),
    __metadata("design:type", String)
], ItemInventoryLotDto.prototype, "menuItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BATCH-2026-001' }),
    __metadata("design:type", String)
], ItemInventoryLotDto.prototype, "batchNo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-05-30T00:00:00.000Z',
        nullable: true,
    }),
    __metadata("design:type", Object)
], ItemInventoryLotDto.prototype, "expiryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-05-02T09:30:00.000Z',
    }),
    __metadata("design:type", String)
], ItemInventoryLotDto.prototype, "receivedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 24 }),
    __metadata("design:type", Number)
], ItemInventoryLotDto.prototype, "receivedQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12 }),
    __metadata("design:type", Number)
], ItemInventoryLotDto.prototype, "remainingQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Initial pharmacy delivery',
        nullable: true,
    }),
    __metadata("design:type", Object)
], ItemInventoryLotDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], ItemInventoryLotDto.prototype, "isExpired", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], ItemInventoryLotDto.prototype, "isDepleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-02T09:30:00.000Z' }),
    __metadata("design:type", String)
], ItemInventoryLotDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-02T09:30:00.000Z' }),
    __metadata("design:type", String)
], ItemInventoryLotDto.prototype, "updatedAt", void 0);
function toItemInventoryLotDto(lot) {
    return {
        id: lot.id,
        menuItemId: lot.menuItemId,
        batchNo: lot.batchNo,
        expiryDate: lot.expiryDate?.toISOString() ?? null,
        receivedAt: lot.receivedAt.toISOString(),
        receivedQuantity: lot.receivedQuantity,
        remainingQuantity: lot.remainingQuantity,
        note: lot.note ?? null,
        isExpired: lot.expiryDate !== null && lot.expiryDate.getTime() < Date.now(),
        isDepleted: lot.remainingQuantity <= 0,
        createdAt: lot.createdAt.toISOString(),
        updatedAt: lot.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=item-inventory-lot.dto.js.map