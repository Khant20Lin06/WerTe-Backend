import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { BulkMarkInventoryAlertsReadDto } from '../dto/bulk-mark-inventory-alerts-read.dto';
import { BulkMarkInventoryAlertsReadResponseDto } from '../dto/bulk-mark-inventory-alerts-read-response.dto';
import { ListNotificationsQueryDto } from '../dto/list-notifications-query.dto';
import { MerchantInventoryAlertPreferenceDto } from '../dto/merchant-inventory-alert-preference.dto';
import { UpdateMerchantInventoryAlertPreferenceDto } from '../dto/update-merchant-inventory-alert-preference.dto';
import { NotificationCenterEntity } from '../entities/notification-center.entity';
import { NotificationCenterPageEntity } from '../entities/notification-center-page.entity';
import { NotificationContractEntity } from '../entities/notification-contract.entity';
import { NotificationListPresetEntity } from '../entities/notification-list-preset.entity';
import { NotificationUnreadCountEntity } from '../entities/notification-unread-count.entity';
import { NotificationUnreadFacetsEntity } from '../entities/notification-unread-facets.entity';
import { NotificationsRestService } from '../services/notifications-rest.service';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsRestService: NotificationsRestService,
  ) {}

  @ApiOperation({
    operationId: 'listCurrentUserNotifications',
    summary: 'List notifications for the authenticated user',
  })
  @ApiOkResponse({
    description: 'Returns the current user notification center list.',
    type: NotificationCenterEntity,
    isArray: true,
  })
  @Get()
  list(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Query() query: ListNotificationsQueryDto,
  ) {
    return this.notificationsRestService.listCurrentUserNotifications(
      currentUser,
      query,
    );
  }

  @ApiOperation({
    operationId: 'listCurrentUserNotificationPage',
    summary:
      'List notifications for the authenticated user with cursor pagination and presets',
  })
  @ApiOkResponse({
    description:
      'Returns a cursor-paginated notification center page for the current user.',
    type: NotificationCenterPageEntity,
  })
  @Get('page')
  listPage(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Query() query: ListNotificationsQueryDto,
  ) {
    return this.notificationsRestService.listCurrentUserNotificationPage(
      currentUser,
      query,
    );
  }

  @ApiOperation({
    operationId: 'getCurrentUserNotificationUnreadCount',
    summary: 'Get the unread notification count for the authenticated user',
  })
  @ApiOkResponse({
    description: 'Returns the unread notification count for the current user.',
    type: NotificationUnreadCountEntity,
  })
  @Get('unread-count')
  unreadCount(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.notificationsRestService.getCurrentUserUnreadCount(currentUser);
  }

  @ApiOperation({
    operationId: 'getCurrentUserNotificationUnreadFacets',
    summary:
      'Get unread notification facets for the authenticated user inventory center',
  })
  @ApiOkResponse({
    description:
      'Returns unread counts grouped for merchant inventory alert tabs and filters.',
    type: NotificationUnreadFacetsEntity,
  })
  @Get('unread-facets')
  unreadFacets(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.notificationsRestService.getCurrentUserUnreadFacets(currentUser);
  }

  @ApiOperation({
    operationId: 'listCurrentUserNotificationPresets',
    summary:
      'List notification center presets for the authenticated user inventory tabs',
  })
  @ApiOkResponse({
    description:
      'Returns backend-defined notification presets with unread counts for tab rendering.',
    type: NotificationListPresetEntity,
    isArray: true,
  })
  @Get('presets')
  presets(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.notificationsRestService.listCurrentUserNotificationPresets(
      currentUser,
    );
  }

  @ApiOperation({
    operationId: 'getCurrentUserNotificationContract',
    summary: 'Get the frozen notification REST and WebSocket contract snapshot',
  })
  @ApiOkResponse({
    description:
      'Returns the stable notification contract for frontend integration, including routes, websocket events, presets, and supported filters.',
    type: NotificationContractEntity,
  })
  @Get('contract')
  contract() {
    return this.notificationsRestService.getCurrentUserNotificationContract();
  }

  @ApiOperation({
    operationId: 'getCurrentMerchantInventoryAlertPreference',
    summary: 'Get merchant inventory alert delivery preferences',
  })
  @ApiOkResponse({
    description:
      'Returns merchant inventory alert push preferences and quiet-hours state for the authenticated merchant.',
    type: MerchantInventoryAlertPreferenceDto,
  })
  @Roles(UserRole.MERCHANT)
  @Get('inventory-alert-preferences')
  inventoryAlertPreferences(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
  ) {
    return this.notificationsRestService.getCurrentMerchantInventoryAlertPreference(
      currentUser,
    );
  }

  @ApiOperation({
    operationId: 'updateCurrentMerchantInventoryAlertPreference',
    summary: 'Update merchant inventory alert delivery preferences',
  })
  @ApiBody({ type: UpdateMerchantInventoryAlertPreferenceDto })
  @ApiOkResponse({
    description:
      'Updates and returns merchant inventory alert push preferences for the authenticated merchant.',
    type: MerchantInventoryAlertPreferenceDto,
  })
  @Roles(UserRole.MERCHANT)
  @Patch('inventory-alert-preferences')
  updateInventoryAlertPreferences(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() payload: UpdateMerchantInventoryAlertPreferenceDto,
  ) {
    return this.notificationsRestService.updateCurrentMerchantInventoryAlertPreference(
      currentUser,
      payload,
    );
  }

  @ApiOperation({
    operationId: 'bulkMarkCurrentUserInventoryAlertsRead',
    summary:
      'Bulk mark inventory alert notifications as read for the authenticated user',
  })
  @ApiOkResponse({
    description:
      'Marks matching inventory alerts as read and returns updated notification snapshots.',
    type: BulkMarkInventoryAlertsReadResponseDto,
  })
  @Post('inventory-alerts/mark-read')
  bulkMarkInventoryAlertsRead(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Body() payload: BulkMarkInventoryAlertsReadDto,
  ) {
    return this.notificationsRestService.bulkMarkCurrentUserInventoryAlertsRead(
      currentUser,
      payload,
    );
  }

  @ApiOperation({
    operationId: 'markCurrentUserNotificationRead',
    summary: 'Mark a notification as read for the authenticated user',
  })
  @ApiParam({
    name: 'notificationId',
    description: 'Notification identifier owned by the authenticated user.',
    example: 'notification_1',
  })
  @ApiOkResponse({
    description: 'Marks the notification as read and returns the updated snapshot.',
    type: NotificationCenterEntity,
  })
  @Post(':notificationId/read')
  markRead(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationsRestService.markCurrentUserNotificationRead(
      currentUser,
      notificationId,
    );
  }

  @ApiOperation({
    operationId: 'markAllCurrentUserNotificationsRead',
    summary: 'Mark every unread notification as read for the authenticated user',
  })
  @ApiOkResponse({
    description: 'Marks all unread notifications as read and returns the count marked.',
  })
  @Post('mark-all-read')
  markAllRead(@CurrentUser() currentUser: AuthenticatedUserEntity) {
    return this.notificationsRestService.markAllCurrentUserNotificationsRead(
      currentUser,
    );
  }
}
