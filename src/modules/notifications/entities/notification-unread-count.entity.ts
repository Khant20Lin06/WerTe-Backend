import { ApiProperty } from '@nestjs/swagger';

export class NotificationUnreadCountEntity {
  @ApiProperty({
    description: 'Total unread notification count for the authenticated user.',
    example: 4,
  })
  unreadCount!: number;
}
