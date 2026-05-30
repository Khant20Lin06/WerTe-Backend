import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ListNotificationsQueryDto } from '../dto/list-notifications-query.dto';
import { NotificationCenterEntity } from '../entities/notification-center.entity';
import { NotificationUnreadCountEntity } from '../entities/notification-unread-count.entity';
import { NotificationsRestService } from '../services/notifications-rest.service';
export declare class NotificationsController {
    private readonly notificationsRestService;
    constructor(notificationsRestService: NotificationsRestService);
    list(currentUser: AuthenticatedUserEntity, query: ListNotificationsQueryDto): Promise<NotificationCenterEntity[]>;
    unreadCount(currentUser: AuthenticatedUserEntity): Promise<NotificationUnreadCountEntity>;
    markRead(currentUser: AuthenticatedUserEntity, notificationId: string): Promise<NotificationCenterEntity>;
}
