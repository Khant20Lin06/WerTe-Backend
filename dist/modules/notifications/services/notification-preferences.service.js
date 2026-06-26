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
exports.NotificationPreferencesService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const audit_service_1 = require("../../audit/services/audit.service");
const merchant_account_service_1 = require("../../merchants/services/merchant-account.service");
const merchant_inventory_alert_preference_dto_1 = require("../dto/merchant-inventory-alert-preference.dto");
const merchant_inventory_alert_preference_entity_1 = require("../entities/merchant-inventory-alert-preference.entity");
const notifications_repository_1 = require("../repositories/notifications.repository");
const notification_preference_time_util_1 = require("../utils/notification-preference-time.util");
const notification_delivery_service_1 = require("./notification-delivery.service");
const notification_preference_schedule_service_1 = require("./notification-preference-schedule.service");
let NotificationPreferencesService = class NotificationPreferencesService {
    constructor(notificationsRepository, merchantAccountService, auditService, notificationDeliveryService, notificationPreferenceScheduleService) {
        this.notificationsRepository = notificationsRepository;
        this.merchantAccountService = merchantAccountService;
        this.auditService = auditService;
        this.notificationDeliveryService = notificationDeliveryService;
        this.notificationPreferenceScheduleService = notificationPreferenceScheduleService;
    }
    async getCurrentMerchantInventoryAlertPreference(currentUser) {
        await this.merchantAccountService.resolveOwnedMerchant(currentUser);
        return this.buildPreferenceDto(await this.getMerchantInventoryAlertPreferenceByUserId(currentUser.userId));
    }
    async updateCurrentMerchantInventoryAlertPreference(currentUser, payload) {
        await this.merchantAccountService.resolveOwnedMerchant(currentUser);
        const currentPreference = await this.getMerchantInventoryAlertPreferenceByUserId(currentUser.userId);
        const nextPreference = this.mergePreferencePayload(currentPreference, payload);
        const updatedPreference = await this.notificationsRepository.upsertNotificationPreferenceByUserId(currentUser.userId, {
            inventoryAlertPushEnabled: nextPreference.inventoryAlertPushEnabled,
            inventoryAlertQuietHoursEnabled: nextPreference.inventoryAlertQuietHoursEnabled,
            inventoryAlertQuietHoursStartLocalTime: nextPreference.inventoryAlertQuietHoursStartLocalTime,
            inventoryAlertQuietHoursEndLocalTime: nextPreference.inventoryAlertQuietHoursEndLocalTime,
            inventoryAlertQuietHoursTimezone: nextPreference.inventoryAlertQuietHoursTimezone,
        });
        await this.auditService.logAction({
            actorType: client_1.AuditActorType.USER,
            actorUserId: currentUser.userId,
            actorRole: currentUser.role,
            actionSource: client_1.AuditActionSource.API,
            action: 'notification_preferences.updated',
            resourceType: client_1.AuditResourceType.USER,
            resourceId: currentUser.userId,
            resourceLabel: 'Merchant inventory alert preferences',
            targetUserId: currentUser.userId,
            metadataJson: {
                inventoryAlertPushEnabled: updatedPreference.inventoryAlertPushEnabled,
                inventoryAlertQuietHoursEnabled: updatedPreference.inventoryAlertQuietHoursEnabled,
                inventoryAlertQuietHoursStartLocalTime: updatedPreference.inventoryAlertQuietHoursStartLocalTime,
                inventoryAlertQuietHoursEndLocalTime: updatedPreference.inventoryAlertQuietHoursEndLocalTime,
                inventoryAlertQuietHoursTimezone: updatedPreference.inventoryAlertQuietHoursTimezone,
            },
        });
        const dto = this.buildPreferenceDto((0, merchant_inventory_alert_preference_entity_1.buildMerchantInventoryAlertPreferenceEntity)({
            userId: currentUser.userId,
            preference: updatedPreference,
        }));
        this.notificationDeliveryService.emitNotificationPreferenceUpdated(currentUser.userId, dto);
        await this.notificationPreferenceScheduleService.rescheduleUser(currentUser.userId);
        return dto;
    }
    async shouldQueueMerchantInventoryAlertPush(userId, at = new Date()) {
        const preference = await this.getMerchantInventoryAlertPreferenceByUserId(userId);
        if (!preference.inventoryAlertPushEnabled) {
            return false;
        }
        return !(0, notification_preference_time_util_1.isInventoryAlertPushMutedNow)(preference, at);
    }
    async getMerchantInventoryAlertPreferenceByUserId(userId) {
        const preference = await this.notificationsRepository.findNotificationPreferenceByUserId(userId);
        return (0, merchant_inventory_alert_preference_entity_1.buildMerchantInventoryAlertPreferenceEntity)({
            userId,
            preference,
        });
    }
    buildPreferenceDto(preference) {
        return (0, merchant_inventory_alert_preference_dto_1.toMerchantInventoryAlertPreferenceDto)({
            preference,
            inventoryAlertPushCurrentlyMuted: (0, notification_preference_time_util_1.isInventoryAlertPushMutedNow)(preference),
        });
    }
    mergePreferencePayload(currentPreference, payload) {
        const nextPreference = {
            userId: currentPreference.userId,
            inventoryAlertPushEnabled: payload.inventoryAlertPushEnabled ??
                currentPreference.inventoryAlertPushEnabled,
            inventoryAlertQuietHoursEnabled: payload.inventoryAlertQuietHoursEnabled ??
                currentPreference.inventoryAlertQuietHoursEnabled,
            inventoryAlertQuietHoursStartLocalTime: payload.inventoryAlertQuietHoursStartLocalTime ??
                currentPreference.inventoryAlertQuietHoursStartLocalTime,
            inventoryAlertQuietHoursEndLocalTime: payload.inventoryAlertQuietHoursEndLocalTime ??
                currentPreference.inventoryAlertQuietHoursEndLocalTime,
            inventoryAlertQuietHoursTimezone: payload.inventoryAlertQuietHoursTimezone ??
                currentPreference.inventoryAlertQuietHoursTimezone,
        };
        if (!nextPreference.inventoryAlertQuietHoursEnabled) {
            return {
                ...nextPreference,
                inventoryAlertQuietHoursStartLocalTime: null,
                inventoryAlertQuietHoursEndLocalTime: null,
                inventoryAlertQuietHoursTimezone: null,
            };
        }
        if (nextPreference.inventoryAlertQuietHoursStartLocalTime === null ||
            nextPreference.inventoryAlertQuietHoursEndLocalTime === null ||
            nextPreference.inventoryAlertQuietHoursTimezone === null) {
            throw new app_exception_1.AppException('Quiet hours require start time, end time, and timezone.', common_1.HttpStatus.BAD_REQUEST, {
                code: error_codes_1.ErrorCodes.badRequest,
            });
        }
        if (nextPreference.inventoryAlertQuietHoursStartLocalTime ===
            nextPreference.inventoryAlertQuietHoursEndLocalTime) {
            throw new app_exception_1.AppException('Quiet hours start and end time must differ.', common_1.HttpStatus.BAD_REQUEST, {
                code: error_codes_1.ErrorCodes.badRequest,
            });
        }
        this.assertValidTimeZone(nextPreference.inventoryAlertQuietHoursTimezone);
        return nextPreference;
    }
    assertValidTimeZone(timeZone) {
        try {
            new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23',
                timeZone,
            }).format(new Date());
        }
        catch {
            throw new app_exception_1.AppException('Quiet hours timezone must be a valid IANA timezone.', common_1.HttpStatus.BAD_REQUEST, {
                code: error_codes_1.ErrorCodes.badRequest,
            });
        }
    }
};
exports.NotificationPreferencesService = NotificationPreferencesService;
exports.NotificationPreferencesService = NotificationPreferencesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_repository_1.NotificationsRepository,
        merchant_account_service_1.MerchantAccountService,
        audit_service_1.AuditService,
        notification_delivery_service_1.NotificationDeliveryService,
        notification_preference_schedule_service_1.NotificationPreferenceScheduleService])
], NotificationPreferencesService);
//# sourceMappingURL=notification-preferences.service.js.map