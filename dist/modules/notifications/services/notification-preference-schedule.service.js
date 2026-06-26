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
exports.NotificationPreferenceScheduleService = void 0;
const common_1 = require("@nestjs/common");
const app_logger_1 = require("../../../infrastructure/logging/app.logger");
const merchant_inventory_alert_preference_dto_1 = require("../dto/merchant-inventory-alert-preference.dto");
const merchant_inventory_alert_preference_entity_1 = require("../entities/merchant-inventory-alert-preference.entity");
const notifications_repository_1 = require("../repositories/notifications.repository");
const notification_preference_time_util_1 = require("../utils/notification-preference-time.util");
const notification_delivery_service_1 = require("./notification-delivery.service");
let NotificationPreferenceScheduleService = class NotificationPreferenceScheduleService {
    constructor(notificationsRepository, notificationDeliveryService, logger) {
        this.notificationsRepository = notificationsRepository;
        this.notificationDeliveryService = notificationDeliveryService;
        this.logger = logger;
        this.timers = new Map();
    }
    async onModuleInit() {
        await this.refreshAllSchedules();
    }
    onModuleDestroy() {
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.timers.clear();
    }
    async rescheduleUser(userId, from = new Date()) {
        this.clearTimer(userId);
        await this.scheduleUser(userId, from);
    }
    async emitCurrentPreferenceStateByUserId(userId, at = new Date()) {
        const preference = await this.loadPreferenceEntity(userId);
        const dto = (0, merchant_inventory_alert_preference_dto_1.toMerchantInventoryAlertPreferenceDto)({
            preference,
            inventoryAlertPushCurrentlyMuted: (0, notification_preference_time_util_1.isInventoryAlertPushMutedNow)(preference, at),
        });
        this.notificationDeliveryService.emitNotificationPreferenceUpdated(userId, dto);
        return dto;
    }
    async refreshAllSchedules(at = new Date()) {
        const preferences = (await this.notificationsRepository.listNotificationPreferencesWithQuietHoursEnabled()) ??
            [];
        for (const preference of preferences) {
            this.schedulePreferenceEntity((0, merchant_inventory_alert_preference_entity_1.buildMerchantInventoryAlertPreferenceEntity)({
                userId: preference.userId,
                preference,
            }), at);
        }
    }
    async scheduleUser(userId, from = new Date()) {
        const preference = await this.loadPreferenceEntity(userId);
        this.schedulePreferenceEntity(preference, from);
    }
    schedulePreferenceEntity(preference, from = new Date()) {
        const nextBoundaryAt = (0, notification_preference_time_util_1.resolveNextQuietHoursBoundaryAt)(preference, from);
        if (nextBoundaryAt === null) {
            return;
        }
        const delayMs = Math.max(nextBoundaryAt.getTime() - from.getTime(), 0);
        const timer = setTimeout(() => {
            void this.handleBoundaryReached(preference.userId);
        }, delayMs);
        timer.unref?.();
        this.timers.set(preference.userId, timer);
        this.logger.debugEvent('Scheduled merchant inventory alert quiet-hours boundary refresh.', {
            nextBoundaryAt: nextBoundaryAt.toISOString(),
            userId: preference.userId,
        }, 'NotificationPreferenceScheduleService');
    }
    async handleBoundaryReached(userId) {
        this.clearTimer(userId);
        const dto = await this.emitCurrentPreferenceStateByUserId(userId);
        await this.scheduleUser(userId);
        this.logger.logEvent('Merchant inventory alert preference boundary refresh processed.', {
            activeDeliveryChannels: dto.activeDeliveryChannels,
            inventoryAlertPushCurrentlyMuted: dto.inventoryAlertPushCurrentlyMuted,
            userId,
        }, 'NotificationPreferenceScheduleService');
    }
    async loadPreferenceEntity(userId) {
        const preference = await this.notificationsRepository.findNotificationPreferenceByUserId(userId);
        return (0, merchant_inventory_alert_preference_entity_1.buildMerchantInventoryAlertPreferenceEntity)({
            userId,
            preference,
        });
    }
    clearTimer(userId) {
        const timer = this.timers.get(userId);
        if (timer !== undefined) {
            clearTimeout(timer);
            this.timers.delete(userId);
        }
    }
};
exports.NotificationPreferenceScheduleService = NotificationPreferenceScheduleService;
exports.NotificationPreferenceScheduleService = NotificationPreferenceScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_repository_1.NotificationsRepository,
        notification_delivery_service_1.NotificationDeliveryService,
        app_logger_1.AppLogger])
], NotificationPreferenceScheduleService);
//# sourceMappingURL=notification-preference-schedule.service.js.map