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
exports.OrderDetailDto = void 0;
exports.toOrderDetailDto = toOrderDetailDto;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const order_summary_dto_1 = require("./order-summary.dto");
class OrderDetailAddressDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'addr_1' }),
    __metadata("design:type", Object)
], OrderDetailAddressDto.prototype, "addressId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Home' }),
    __metadata("design:type", Object)
], OrderDetailAddressDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'No. 1, Main Road' }),
    __metadata("design:type", Object)
], OrderDetailAddressDto.prototype, "line1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Room 5B' }),
    __metadata("design:type", Object)
], OrderDetailAddressDto.prototype, "line2", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Near City Mart' }),
    __metadata("design:type", Object)
], OrderDetailAddressDto.prototype, "landmark", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Botahtaung' }),
    __metadata("design:type", Object)
], OrderDetailAddressDto.prototype, "township", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Yangon' }),
    __metadata("design:type", Object)
], OrderDetailAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '11111' }),
    __metadata("design:type", Object)
], OrderDetailAddressDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Call before arrival' }),
    __metadata("design:type", Object)
], OrderDetailAddressDto.prototype, "deliveryInstructions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '16.834' }),
    __metadata("design:type", Object)
], OrderDetailAddressDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '96.176' }),
    __metadata("design:type", Object)
], OrderDetailAddressDto.prototype, "longitude", void 0);
class OrderDetailSelectedOptionDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order_item_option_1' }),
    __metadata("design:type", String)
], OrderDetailSelectedOptionDto.prototype, "orderItemOptionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'option_1' }),
    __metadata("design:type", String)
], OrderDetailSelectedOptionDto.prototype, "itemOptionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'group_1' }),
    __metadata("design:type", String)
], OrderDetailSelectedOptionDto.prototype, "optionGroupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Choose extras' }),
    __metadata("design:type", String)
], OrderDetailSelectedOptionDto.prototype, "optionGroupNameSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.ItemOptionGroupKind,
        example: client_1.ItemOptionGroupKind.ADD_ON,
    }),
    __metadata("design:type", String)
], OrderDetailSelectedOptionDto.prototype, "optionGroupKindSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Extra fish cake' }),
    __metadata("design:type", String)
], OrderDetailSelectedOptionDto.prototype, "nameSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '750' }),
    __metadata("design:type", String)
], OrderDetailSelectedOptionDto.prototype, "priceDeltaSnapshot", void 0);
class OrderDetailInventoryLotAllocationDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order_item_lot_alloc_1' }),
    __metadata("design:type", String)
], OrderDetailInventoryLotAllocationDto.prototype, "orderItemInventoryLotAllocationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'lot_1' }),
    __metadata("design:type", String)
], OrderDetailInventoryLotAllocationDto.prototype, "inventoryLotId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BATCH-001' }),
    __metadata("design:type", String)
], OrderDetailInventoryLotAllocationDto.prototype, "batchNoSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-05-30T00:00:00.000Z' }),
    __metadata("design:type", Object)
], OrderDetailInventoryLotAllocationDto.prototype, "expiryDateSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], OrderDetailInventoryLotAllocationDto.prototype, "quantity", void 0);
class OrderDetailItemDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order_item_1' }),
    __metadata("design:type", String)
], OrderDetailItemDto.prototype, "orderItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'item_1' }),
    __metadata("design:type", String)
], OrderDetailItemDto.prototype, "menuItemId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'cat_1' }),
    __metadata("design:type", Object)
], OrderDetailItemDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mohinga' }),
    __metadata("design:type", String)
], OrderDetailItemDto.prototype, "nameSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Breakfast item' }),
    __metadata("design:type", Object)
], OrderDetailItemDto.prototype, "descriptionSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], OrderDetailItemDto.prototype, "imageUrlSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'variant_combo_1' }),
    __metadata("design:type", Object)
], OrderDetailItemDto.prototype, "selectedVariantCombinationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Small / Red / Cotton' }),
    __metadata("design:type", Object)
], OrderDetailItemDto.prototype, "selectedVariantCombinationNameSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2500' }),
    __metadata("design:type", String)
], OrderDetailItemDto.prototype, "unitBasePriceSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3250' }),
    __metadata("design:type", String)
], OrderDetailItemDto.prototype, "unitPriceSnapshot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], OrderDetailItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6500' }),
    __metadata("design:type", String)
], OrderDetailItemDto.prototype, "lineTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: () => OrderDetailInventoryLotAllocationDto,
        isArray: true,
    }),
    __metadata("design:type", Array)
], OrderDetailItemDto.prototype, "inventoryLotAllocations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => OrderDetailSelectedOptionDto, isArray: true }),
    __metadata("design:type", Array)
], OrderDetailItemDto.prototype, "selectedOptions", void 0);
class OrderTimelineEntryDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'hist_1' }),
    __metadata("design:type", String)
], OrderTimelineEntryDto.prototype, "orderStatusHistoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], OrderTimelineEntryDto.prototype, "fromStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PLACED' }),
    __metadata("design:type", String)
], OrderTimelineEntryDto.prototype, "toStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'usr_1' }),
    __metadata("design:type", Object)
], OrderTimelineEntryDto.prototype, "changedByUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'checkout_submitted' }),
    __metadata("design:type", Object)
], OrderTimelineEntryDto.prototype, "reasonCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], OrderTimelineEntryDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-19T10:00:00.000Z' }),
    __metadata("design:type", String)
], OrderTimelineEntryDto.prototype, "createdAt", void 0);
function toOrderDetailSelectedOptionDto(selectedOption) {
    return {
        orderItemOptionId: selectedOption.orderItemOptionId,
        itemOptionId: selectedOption.itemOptionId,
        optionGroupId: selectedOption.optionGroupId,
        optionGroupNameSnapshot: selectedOption.optionGroupNameSnapshot,
        optionGroupKindSnapshot: selectedOption.optionGroupKindSnapshot,
        nameSnapshot: selectedOption.nameSnapshot,
        priceDeltaSnapshot: selectedOption.priceDeltaSnapshot,
    };
}
function toOrderDetailInventoryLotAllocationDto(allocation) {
    return {
        orderItemInventoryLotAllocationId: allocation.orderItemInventoryLotAllocationId,
        inventoryLotId: allocation.inventoryLotId,
        batchNoSnapshot: allocation.batchNoSnapshot,
        expiryDateSnapshot: allocation.expiryDateSnapshot,
        quantity: allocation.quantity,
    };
}
function toOrderDetailItemDto(item) {
    return {
        orderItemId: item.orderItemId,
        menuItemId: item.menuItemId,
        categoryId: item.categoryId,
        nameSnapshot: item.nameSnapshot,
        descriptionSnapshot: item.descriptionSnapshot,
        imageUrlSnapshot: item.imageUrlSnapshot,
        selectedVariantCombinationId: item.selectedVariantCombinationId,
        selectedVariantCombinationNameSnapshot: item.selectedVariantCombinationNameSnapshot,
        unitBasePriceSnapshot: item.unitBasePriceSnapshot,
        unitPriceSnapshot: item.unitPriceSnapshot,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
        inventoryLotAllocations: item.inventoryLotAllocations.map((allocation) => toOrderDetailInventoryLotAllocationDto(allocation)),
        selectedOptions: item.selectedOptions.map((selectedOption) => toOrderDetailSelectedOptionDto(selectedOption)),
    };
}
function toOrderTimelineEntryDto(entry) {
    return {
        orderStatusHistoryId: entry.orderStatusHistoryId,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        changedByUserId: entry.changedByUserId,
        reasonCode: entry.reasonCode,
        note: entry.note,
        createdAt: entry.createdAt,
    };
}
class OrderDetailDto extends order_summary_dto_1.OrderSummaryDto {
}
exports.OrderDetailDto = OrderDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => OrderDetailAddressDto }),
    __metadata("design:type", OrderDetailAddressDto)
], OrderDetailDto.prototype, "deliveryAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => OrderDetailItemDto, isArray: true }),
    __metadata("design:type", Array)
], OrderDetailDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => OrderTimelineEntryDto, isArray: true }),
    __metadata("design:type", Array)
], OrderDetailDto.prototype, "timeline", void 0);
function toOrderDetailDto(order) {
    const summary = (0, order_summary_dto_1.toOrderSummaryDto)(order);
    return {
        ...summary,
        deliveryAddress: {
            addressId: order.deliveryAddress.addressId,
            label: order.deliveryAddress.label,
            line1: order.deliveryAddress.line1,
            line2: order.deliveryAddress.line2,
            landmark: order.deliveryAddress.landmark,
            township: order.deliveryAddress.township,
            city: order.deliveryAddress.city,
            postalCode: order.deliveryAddress.postalCode,
            deliveryInstructions: order.deliveryAddress.deliveryInstructions,
            latitude: order.deliveryAddress.latitude,
            longitude: order.deliveryAddress.longitude,
        },
        items: order.items.map((item) => toOrderDetailItemDto(item)),
        timeline: order.timeline.map((entry) => toOrderTimelineEntryDto(entry)),
    };
}
//# sourceMappingURL=order-detail.dto.js.map