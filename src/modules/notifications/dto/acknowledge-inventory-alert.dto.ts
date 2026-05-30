import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AcknowledgeInventoryAlertDto {
  @ApiPropertyOptional({
    description: 'Optional administrative acknowledgement note.',
    example: 'Merchant contacted and confirmed a restock ETA.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
