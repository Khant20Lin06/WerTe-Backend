import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { OrderSummaryDto } from './order-summary.dto';

export class RiderOrderListDto {
  @ApiProperty({ type: () => OrderSummaryDto, isArray: true })
  data!: OrderSummaryDto[];

  @ApiPropertyOptional({ example: 'order_123', nullable: true })
  nextCursor!: string | null;

  @ApiProperty({ example: true })
  hasMore!: boolean;
}
