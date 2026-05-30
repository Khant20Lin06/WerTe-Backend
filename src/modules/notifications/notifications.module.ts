import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuditModule } from '../audit/audit.module';
import { AuthRepository } from '../auth/repositories/auth.repository';
import { MerchantsModule } from '../merchants/merchants.module';
import { UsersModule } from '../users/users.module';
import { AdminInventoryAlertsController } from './controllers/admin-inventory-alerts.controller';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationAlertDigestScheduleService } from './services/notification-alert-digest-schedule.service';
import { NotificationAlertDigestService } from './services/notification-alert-digest.service';
import { NotificationEventService } from './services/notification-event.service';
import { NotificationDeliveryService } from './services/notification-delivery.service';
import { NotificationPreferencesService } from './services/notification-preferences.service';
import { NotificationPreferenceScheduleService } from './services/notification-preference-schedule.service';
import { NotificationsRepository } from './repositories/notifications.repository';
import { AdminInventoryAlertsService } from './services/admin-inventory-alerts.service';
import { NotificationsRestService } from './services/notifications-rest.service';
import { NotificationsSocketAuthService } from './services/notifications-socket-auth.service';
import { NotificationsService } from './services/notifications.service';

@Module({
  imports: [JwtModule.register({}), UsersModule, AuditModule, MerchantsModule],
  controllers: [NotificationsController, AdminInventoryAlertsController],
  providers: [
    AuthRepository,
    NotificationsRepository,
    NotificationsService,
    NotificationDeliveryService,
    NotificationAlertDigestService,
    NotificationAlertDigestScheduleService,
    NotificationsSocketAuthService,
    NotificationPreferenceScheduleService,
    NotificationPreferencesService,
    NotificationEventService,
    NotificationsRestService,
    AdminInventoryAlertsService,
    NotificationsGateway,
  ],
  exports: [
    NotificationsRepository,
    NotificationsService,
    NotificationDeliveryService,
    NotificationAlertDigestService,
    NotificationPreferenceScheduleService,
    NotificationPreferencesService,
    NotificationEventService,
    NotificationsRestService,
    AdminInventoryAlertsService,
  ],
})
export class NotificationsModule {}
