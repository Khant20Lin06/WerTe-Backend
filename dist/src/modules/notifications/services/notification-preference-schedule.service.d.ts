import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AppLogger } from '../../../infrastructure/logging/app.logger';
import { MerchantInventoryAlertPreferenceDto } from '../dto/merchant-inventory-alert-preference.dto';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationDeliveryService } from './notification-delivery.service';
export declare class NotificationPreferenceScheduleService implements OnModuleInit, OnModuleDestroy {
    private readonly notificationsRepository;
    private readonly notificationDeliveryService;
    private readonly logger;
    private readonly timers;
    constructor(notificationsRepository: NotificationsRepository, notificationDeliveryService: NotificationDeliveryService, logger: AppLogger);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    rescheduleUser(userId: string, from?: Date): Promise<void>;
    emitCurrentPreferenceStateByUserId(userId: string, at?: Date): Promise<MerchantInventoryAlertPreferenceDto>;
    private refreshAllSchedules;
    private scheduleUser;
    private schedulePreferenceEntity;
    private handleBoundaryReached;
    private loadPreferenceEntity;
    private clearTimer;
}
