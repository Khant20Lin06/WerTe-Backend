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
exports.MerchantInventoryAlertPreferenceDto = exports.MerchantInventoryAlertDeliveryLaneDto = void 0;
exports.toMerchantInventoryAlertPreferenceDto = toMerchantInventoryAlertPreferenceDto;
const swagger_1 = require("@nestjs/swagger");
class MerchantInventoryAlertDeliveryLaneDto {
}
exports.MerchantInventoryAlertDeliveryLaneDto = MerchantInventoryAlertDeliveryLaneDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'IN_APP',
        enum: ['IN_APP', 'PUSH'],
        description: 'Delivery lane identifier for merchant inventory alerts.',
    }),
    __metadata("design:type", String)
], MerchantInventoryAlertDeliveryLaneDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'When true, the delivery lane is configured to be available.',
    }),
    __metadata("design:type", Boolean)
], MerchantInventoryAlertDeliveryLaneDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'When true, the delivery lane is active right now.',
    }),
    __metadata("design:type", Boolean)
], MerchantInventoryAlertDeliveryLaneDto.prototype, "active", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: null,
        nullable: true,
        enum: ['PUSH_DISABLED', 'QUIET_HOURS_MUTED', null],
        description: 'Optional reason why the delivery lane is not currently active.',
    }),
    __metadata("design:type", Object)
], MerchantInventoryAlertDeliveryLaneDto.prototype, "suppressionReason", void 0);
class MerchantInventoryAlertPreferenceDto {
}
exports.MerchantInventoryAlertPreferenceDto = MerchantInventoryAlertPreferenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'usr_merchant_1',
        description: 'Merchant user identifier that owns these inventory alert preferences.',
    }),
    __metadata("design:type", String)
], MerchantInventoryAlertPreferenceDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'When true, merchant inventory alerts can enqueue push delivery attempts.',
    }),
    __metadata("design:type", Boolean)
], MerchantInventoryAlertPreferenceDto.prototype, "inventoryAlertPushEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'When true, quiet hours mute merchant inventory alert push delivery attempts.',
    }),
    __metadata("design:type", Boolean)
], MerchantInventoryAlertPreferenceDto.prototype, "inventoryAlertQuietHoursEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '22:00',
        nullable: true,
        description: 'Quiet-hours local start time in HH:mm format when enabled.',
    }),
    __metadata("design:type", Object)
], MerchantInventoryAlertPreferenceDto.prototype, "inventoryAlertQuietHoursStartLocalTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '06:00',
        nullable: true,
        description: 'Quiet-hours local end time in HH:mm format when enabled.',
    }),
    __metadata("design:type", Object)
], MerchantInventoryAlertPreferenceDto.prototype, "inventoryAlertQuietHoursEndLocalTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Asia/Bangkok',
        nullable: true,
        description: 'IANA timezone used to evaluate the quiet-hours local window.',
    }),
    __metadata("design:type", Object)
], MerchantInventoryAlertPreferenceDto.prototype, "inventoryAlertQuietHoursTimezone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Computed flag showing whether merchant inventory alert push delivery is muted right now.',
    }),
    __metadata("design:type", Boolean)
], MerchantInventoryAlertPreferenceDto.prototype, "inventoryAlertPushCurrentlyMuted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [MerchantInventoryAlertDeliveryLaneDto],
        description: 'Computed delivery-lane state snapshot for in-app and push merchant inventory alerts.',
    }),
    __metadata("design:type", Array)
], MerchantInventoryAlertPreferenceDto.prototype, "deliveryLanes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['IN_APP', 'PUSH'],
        isArray: true,
        enum: ['IN_APP', 'PUSH'],
        description: 'Computed list of delivery channels that are active right now.',
    }),
    __metadata("design:type", Array)
], MerchantInventoryAlertPreferenceDto.prototype, "activeDeliveryChannels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: null,
        nullable: true,
        enum: ['PUSH_DISABLED', 'QUIET_HOURS_MUTED', null],
        description: 'Optional push-lane suppression reason when merchant inventory alert push is not active.',
    }),
    __metadata("design:type", Object)
], MerchantInventoryAlertPreferenceDto.prototype, "inventoryAlertPushSuppressedReason", void 0);
function toMerchantInventoryAlertPreferenceDto(input) {
    return {
        userId: input.preference.userId,
        inventoryAlertPushEnabled: input.preference.inventoryAlertPushEnabled,
        inventoryAlertQuietHoursEnabled: input.preference.inventoryAlertQuietHoursEnabled,
        inventoryAlertQuietHoursStartLocalTime: input.preference.inventoryAlertQuietHoursStartLocalTime,
        inventoryAlertQuietHoursEndLocalTime: input.preference.inventoryAlertQuietHoursEndLocalTime,
        inventoryAlertQuietHoursTimezone: input.preference.inventoryAlertQuietHoursTimezone,
        inventoryAlertPushCurrentlyMuted: input.inventoryAlertPushCurrentlyMuted,
        deliveryLanes: [
            {
                channel: 'IN_APP',
                enabled: true,
                active: true,
                suppressionReason: null,
            },
            {
                channel: 'PUSH',
                enabled: input.preference.inventoryAlertPushEnabled,
                active: input.preference.inventoryAlertPushEnabled &&
                    !input.inventoryAlertPushCurrentlyMuted,
                suppressionReason: !input.preference.inventoryAlertPushEnabled
                    ? 'PUSH_DISABLED'
                    : input.inventoryAlertPushCurrentlyMuted
                        ? 'QUIET_HOURS_MUTED'
                        : null,
            },
        ],
        activeDeliveryChannels: input.preference.inventoryAlertPushEnabled &&
            !input.inventoryAlertPushCurrentlyMuted
            ? ['IN_APP', 'PUSH']
            : ['IN_APP'],
        inventoryAlertPushSuppressedReason: !input.preference.inventoryAlertPushEnabled
            ? 'PUSH_DISABLED'
            : input.inventoryAlertPushCurrentlyMuted
                ? 'QUIET_HOURS_MUTED'
                : null,
    };
}
//# sourceMappingURL=merchant-inventory-alert-preference.dto.js.map