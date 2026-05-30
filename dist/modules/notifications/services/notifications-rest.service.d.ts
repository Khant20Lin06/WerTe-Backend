import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ListNotificationsQueryDto } from '../dto/list-notifications-query.dto';
import { NotificationCenterEntity } from '../entities/notification-center.entity';
import { NotificationUnreadCountEntity } from '../entities/notification-unread-count.entity';
import { NotificationsService } from './notifications.service';
export declare class NotificationsRestService {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    listCurrentUserNotifications(currentUser: AuthenticatedUserEntity, query: ListNotificationsQueryDto): Promise<NotificationCenterEntity[]>;
    getCurrentUserUnreadCount(currentUser: AuthenticatedUserEntity): Promise<NotificationUnreadCountEntity>;
    markCurrentUserNotificationRead(currentUser: AuthenticatedUserEntity, notificationId: string): Promise<NotificationCenterEntity>;
}
