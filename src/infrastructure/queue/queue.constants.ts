export const QueueNames = {
  notifications: 'notifications',
  orderTimeouts: 'order-timeouts',
  messagingFallback: 'messaging-fallback',
  riderLocationCleanup: 'rider-location-cleanup',
  providerWebhooks: 'provider-webhooks',
  dispatch: 'dispatch',
} as const;

export const QueueJobNames = {
  notifications: {
    pushNotification: 'push-notification',
    inventoryAlertDigest: 'inventory-alert-digest',
  },
  orderTimeouts: {
    startTimeout: 'start-timeout',
  },
  messagingFallback: {
    pushFallback: 'message-push-fallback',
  },
  riderLocationCleanup: {
    cleanupStaleLocations: 'cleanup-stale-locations',
  },
  providerWebhooks: {
    processPaymentEvent: 'process-payment-provider-event',
    processRefundEvent: 'process-refund-provider-event',
    reconcileEvents: 'reconcile-provider-events',
  },
  dispatch: {
    autoDispatchOrder: 'auto-dispatch-order',
    autoDispatchPendingForRider: 'auto-dispatch-pending-for-rider',
  },
} as const;

export type QueueName = (typeof QueueNames)[keyof typeof QueueNames];
