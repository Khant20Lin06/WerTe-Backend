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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const list_notifications_query_dto_1 = require("../dto/list-notifications-query.dto");
const notification_center_entity_1 = require("../entities/notification-center.entity");
const notification_unread_count_entity_1 = require("../entities/notification-unread-count.entity");
const notifications_rest_service_1 = require("../services/notifications-rest.service");
let NotificationsController = class NotificationsController {
    constructor(notificationsRestService) {
        this.notificationsRestService = notificationsRestService;
    }
    list(currentUser, query) {
        return this.notificationsRestService.listCurrentUserNotifications(currentUser, query);
    }
    unreadCount(currentUser) {
        return this.notificationsRestService.getCurrentUserUnreadCount(currentUser);
    }
    markRead(currentUser, notificationId) {
        return this.notificationsRestService.markCurrentUserNotificationRead(currentUser, notificationId);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listCurrentUserNotifications',
        summary: 'List notifications for the authenticated user',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the current user notification center list.',
        type: notification_center_entity_1.NotificationCenterEntity,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        list_notifications_query_dto_1.ListNotificationsQueryDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getCurrentUserNotificationUnreadCount',
        summary: 'Get the unread notification count for the authenticated user',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the unread notification count for the current user.',
        type: notification_unread_count_entity_1.NotificationUnreadCountEntity,
    }),
    (0, common_1.Get)('unread-count'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "unreadCount", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'markCurrentUserNotificationRead',
        summary: 'Mark a notification as read for the authenticated user',
    }),
    (0, swagger_1.ApiParam)({
        name: 'notificationId',
        description: 'Notification identifier owned by the authenticated user.',
        example: 'notification_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Marks the notification as read and returns the updated snapshot.',
        type: notification_center_entity_1.NotificationCenterEntity,
    }),
    (0, common_1.Post)(':notificationId/read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('notificationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markRead", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notifications_rest_service_1.NotificationsRestService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map