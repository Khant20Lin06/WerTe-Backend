export declare class AdminInventoryAlertTrendBucketDto {
    date: string;
    createdAlertsCount: number;
    attentionAlertsCount: number;
    compensationAlertsCount: number;
    unreadMerchantAlertsCount: number;
    acknowledgedCount: number;
    resolvedCount: number;
    dismissedCount: number;
    reminderCount: number;
    escalationCount: number;
}
export declare class AdminInventoryAlertTrendsReportDto {
    generatedAt: string;
    windowStartedAt: string;
    windowEndedAt: string;
    periodDays: number;
    buckets: AdminInventoryAlertTrendBucketDto[];
}
