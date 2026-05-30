export const WebsocketEvents = {
  orderUpdated: 'order.updated',
  messageCreated: 'message.created',
  messageRead: 'message.read',
  notificationCreated: 'notification.created',
  notificationRead: 'notification.read',
  notificationBulkRead: 'notification.bulk-read',
  notificationUnreadCountUpdated: 'notification.unread-count.updated',
  notificationUnreadFacetsUpdated: 'notification.unread-facets.updated',
  notificationPresetsUpdated: 'notification.presets.updated',
  notificationPreferenceUpdated: 'notification.preference.updated',
} as const;
