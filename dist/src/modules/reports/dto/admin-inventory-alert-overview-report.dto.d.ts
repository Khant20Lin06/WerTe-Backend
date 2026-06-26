export declare class AdminInventoryAlertReportKindCountsDto {
    attentionAlertsCount: number;
    compensationAlertsCount: number;
}
export declare class AdminInventoryAlertReportStatusCountsDto {
    openAlertsCount: number;
    acknowledgedAlertsCount: number;
    resolvedAlertsCount: number;
    dismissedAlertsCount: number;
}
export declare class AdminInventoryAlertReportAttentionLevelCountsDto {
    lowStockAlertsCount: number;
    outOfStockAlertsCount: number;
}
export declare class AdminInventoryAlertReportResourceTypeCountsDto {
    menuItemAlertsCount: number;
    itemOptionAlertsCount: number;
}
export declare class AdminInventoryAlertReportFollowUpCountsDto {
    reminderCount: number;
    escalationCount: number;
}
export declare class AdminInventoryAlertReportDeliveryCountsDto {
    pushPendingCount: number;
    pushQueuedCount: number;
    pushSentCount: number;
    pushDeliveredCount: number;
    pushFailedCount: number;
}
export declare class AdminInventoryAlertReportBranchSummaryDto {
    branchId: string | null;
    branchName: string | null;
    totalAlertsCount: number;
    openLifecycleAlertsCount: number;
    escalatedAlertsCount: number;
}
export declare class AdminInventoryAlertOverviewReportDto {
    generatedAt: string;
    windowStartedAt: string;
    windowEndedAt: string;
    periodDays: number;
    totalAlertsCount: number;
    unreadMerchantAlertsCount: number;
    kindCounts: AdminInventoryAlertReportKindCountsDto;
    statusCounts: AdminInventoryAlertReportStatusCountsDto;
    attentionLevelCounts: AdminInventoryAlertReportAttentionLevelCountsDto;
    resourceTypeCounts: AdminInventoryAlertReportResourceTypeCountsDto;
    followUpCounts: AdminInventoryAlertReportFollowUpCountsDto;
    deliveryCounts: AdminInventoryAlertReportDeliveryCountsDto;
    topBranches: AdminInventoryAlertReportBranchSummaryDto[];
}
