export declare const QueueNames: {
    readonly notifications: "notifications";
    readonly orderTimeouts: "order-timeouts";
    readonly messagingFallback: "messaging-fallback";
    readonly riderLocationCleanup: "rider-location-cleanup";
    readonly providerWebhooks: "provider-webhooks";
    readonly dispatch: "dispatch";
};
export declare const QueueJobNames: {
    readonly notifications: {
        readonly pushNotification: "push-notification";
        readonly inventoryAlertDigest: "inventory-alert-digest";
    };
    readonly orderTimeouts: {
        readonly startTimeout: "start-timeout";
    };
    readonly messagingFallback: {
        readonly pushFallback: "message-push-fallback";
    };
    readonly riderLocationCleanup: {
        readonly cleanupStaleLocations: "cleanup-stale-locations";
    };
    readonly providerWebhooks: {
        readonly processPaymentEvent: "process-payment-provider-event";
        readonly processRefundEvent: "process-refund-provider-event";
        readonly reconcileEvents: "reconcile-provider-events";
    };
    readonly dispatch: {
        readonly autoDispatchOrder: "auto-dispatch-order";
        readonly autoDispatchPendingForRider: "auto-dispatch-pending-for-rider";
    };
};
export type QueueName = (typeof QueueNames)[keyof typeof QueueNames];
