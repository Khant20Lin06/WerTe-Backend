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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const notification_center_entity_1 = require("../entities/notification-center.entity");
const notifications_repository_1 = require("../repositories/notifications.repository");
let NotificationsService = class NotificationsService {
    constructor(notificationsRepository) {
        this.notificationsRepository = notificationsRepository;
    }
    async listUserNotifications(userId, limit = 20) {
        const notifications = await this.notificationsRepository.listByUserId(userId, limit);
        return notifications.map((notification) => (0, notification_center_entity_1.buildNotificationCenterEntity)(notification));
    }
    getUnreadCount(userId) {
        return this.notificationsRepository.countUnreadByUserId(userId);
    }
    async createNotification(payload) {
        const notification = await this.notificationsRepository.create(payload);
        return (0, notification_center_entity_1.buildNotificationCenterEntity)(notification);
    }
    async markNotificationRead(userId, notificationId) {
        const notification = await this.notificationsRepository.markRead(notificationId, userId);
        return notification === null
            ? null
            : (0, notification_center_entity_1.buildNotificationCenterEntity)(notification);
    }
    createDeliveryAttempt(payload) {
        return this.notificationsRepository.createDeliveryAttempt(payload);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_repository_1.NotificationsRepository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map