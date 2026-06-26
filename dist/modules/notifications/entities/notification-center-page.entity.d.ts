import { NotificationCenterEntity } from './notification-center.entity';
export declare class NotificationCenterPageEntity {
    nextCursor: string | null;
    hasMore: boolean;
    appliedPreset: string | null;
    generatedAt: string;
    cacheTtlSeconds: number;
    suggestedPollIntervalSeconds: number;
    notifications: NotificationCenterEntity[];
}
export declare function buildNotificationCenterPage(input: {
    nextCursor: string | null;
    hasMore: boolean;
    appliedPreset: string | null;
    generatedAt: string;
    cacheTtlSeconds: number;
    suggestedPollIntervalSeconds: number;
    notifications: NotificationCenterEntity[];
}): NotificationCenterPageEntity;
