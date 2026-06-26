import { Module } from '@nestjs/common';

/**
 * WebSocket infrastructure module.
 *
 * Authentication is handled per-gateway at connection time:
 *   - /messaging  → MessagingSocketAuthService (MessagingModule)
 *   - /notifications → NotificationsSocketAuthService (NotificationsModule)
 *
 * Each gateway calls authenticateClient() in handleConnection() and
 * disconnects the socket immediately on any auth failure.
 */
@Module({})
export class WebsocketModule {}
