import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminUpdateOrderStatusDto {
  @ApiProperty({
    description: 'New order status requested by the admin control plane.',
    enum: OrderStatus,
    enumName: 'OrderStatus',
    example: OrderStatus.RIDER_ASSIGNED,
  })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiProperty({
    description:
      'Required structured reason code explaining why the admin override is being performed.',
    example: 'admin_override_manual_reassignment',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  reasonCode!: string;

  @ApiPropertyOptional({
    description:
      'Optional administrative note attached to the status override action.',
    example: 'Dispatcher is manually moving this order back into assignment.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
