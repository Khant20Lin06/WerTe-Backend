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
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const bulk_mark_inventory_alerts_read_dto_1 = require("../dto/bulk-mark-inventory-alerts-read.dto");
const bulk_mark_inventory_alerts_read_response_dto_1 = require("../dto/bulk-mark-inventory-alerts-read-response.dto");
const list_notifications_query_dto_1 = require("../dto/list-notifications-query.dto");
const merchant_inventory_alert_preference_dto_1 = require("../dto/merchant-inventory-alert-preference.dto");
const update_merchant_inventory_alert_preference_dto_1 = require("../dto/update-merchant-inventory-alert-preference.dto");
const notification_center_entity_1 = require("../entities/notification-center.entity");
const notification_center_page_entity_1 = require("../entities/notification-center-page.entity");
const notification_contract_entity_1 = require("../entities/notification-contract.entity");
const notification_list_preset_entity_1 = require("../entities/notification-list-preset.entity");
const notification_unread_count_entity_1 = require("../entities/notification-unread-count.entity");
const notification_unread_facets_entity_1 = require("../entities/notification-unread-facets.entity");
const notifications_rest_service_1 = require("../services/notifications-rest.service");
let NotificationsController = class NotificationsController {
    constructor(notificationsRestService) {
        this.notificationsRestService = notificationsRestService;
    }
    list(currentUser, query) {
        return this.notificationsRestService.listCurrentUserNotifications(currentUser, query);
    }
    listPage(currentUser, query) {
        return this.notificationsRestService.listCurrentUserNotificationPage(currentUser, query);
    }
    unreadCount(currentUser) {
        return this.notificationsRestService.getCurrentUserUnreadCount(currentUser);
    }
    unreadFacets(currentUser) {
        return this.notificationsRestService.getCurrentUserUnreadFacets(currentUser);
    }
    presets(currentUser) {
        return this.notificationsRestService.listCurrentUserNotificationPresets(currentUser);
    }
    contract() {
        return this.notificationsRestService.getCurrentUserNotificationContract();
    }
    inventoryAlertPreferences(currentUser) {
        return this.notificationsRestService.getCurrentMerchantInventoryAlertPreference(currentUser);
    }
    updateInventoryAlertPreferences(currentUser, payload) {
        return this.notificationsRestService.updateCurrentMerchantInventoryAlertPreference(currentUser, payload);
    }
    bulkMarkInventoryAlertsRead(currentUser, payload) {
        return this.notificationsRestService.bulkMarkCurrentUserInventoryAlertsRead(currentUser, payload);
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
        operationId: 'listCurrentUserNotificationPage',
        summary: 'List notifications for the authenticated user with cursor pagination and presets',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns a cursor-paginated notification center page for the current user.',
        type: notification_center_page_entity_1.NotificationCenterPageEntity,
    }),
    (0, common_1.Get)('page'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        list_notifications_query_dto_1.ListNotificationsQueryDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "listPage", null);
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
        operationId: 'getCurrentUserNotificationUnreadFacets',
        summary: 'Get unread notification facets for the authenticated user inventory center',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns unread counts grouped for merchant inventory alert tabs and filters.',
        type: notification_unread_facets_entity_1.NotificationUnreadFacetsEntity,
    }),
    (0, common_1.Get)('unread-facets'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "unreadFacets", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listCurrentUserNotificationPresets',
        summary: 'List notification center presets for the authenticated user inventory tabs',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns backend-defined notification presets with unread counts for tab rendering.',
        type: notification_list_preset_entity_1.NotificationListPresetEntity,
        isArray: true,
    }),
    (0, common_1.Get)('presets'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "presets", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getCurrentUserNotificationContract',
        summary: 'Get the frozen notification REST and WebSocket contract snapshot',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the stable notification contract for frontend integration, including routes, websocket events, presets, and supported filters.',
        type: notification_contract_entity_1.NotificationContractEntity,
    }),
    (0, common_1.Get)('contract'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "contract", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getCurrentMerchantInventoryAlertPreference',
        summary: 'Get merchant inventory alert delivery preferences',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns merchant inventory alert push preferences and quiet-hours state for the authenticated merchant.',
        type: merchant_inventory_alert_preference_dto_1.MerchantInventoryAlertPreferenceDto,
    }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Get)('inventory-alert-preferences'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "inventoryAlertPreferences", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateCurrentMerchantInventoryAlertPreference',
        summary: 'Update merchant inventory alert delivery preferences',
    }),
    (0, swagger_1.ApiBody)({ type: update_merchant_inventory_alert_preference_dto_1.UpdateMerchantInventoryAlertPreferenceDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates and returns merchant inventory alert push preferences for the authenticated merchant.',
        type: merchant_inventory_alert_preference_dto_1.MerchantInventoryAlertPreferenceDto,
    }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Patch)('inventory-alert-preferences'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        update_merchant_inventory_alert_preference_dto_1.UpdateMerchantInventoryAlertPreferenceDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "updateInventoryAlertPreferences", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'bulkMarkCurrentUserInventoryAlertsRead',
        summary: 'Bulk mark inventory alert notifications as read for the authenticated user',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Marks matching inventory alerts as read and returns updated notification snapshots.',
        type: bulk_mark_inventory_alerts_read_response_dto_1.BulkMarkInventoryAlertsReadResponseDto,
    }),
    (0, common_1.Post)('inventory-alerts/mark-read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        bulk_mark_inventory_alerts_read_dto_1.BulkMarkInventoryAlertsReadDto]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "bulkMarkInventoryAlertsRead", null);
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