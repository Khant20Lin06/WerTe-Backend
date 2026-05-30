import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const adminInventoryAlertReportMaxDays = 30;

export class ListAdminInventoryAlertReportQueryDto {
  @ApiPropertyOptional({
    description: 'Number of trailing UTC days to include in the analytics window.',
    example: 7,
    minimum: 1,
    maximum: adminInventoryAlertReportMaxDays,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(adminInventoryAlertReportMaxDays)
  days?: number;

  @ApiPropertyOptional({
    description: 'Optional branch filter for inventory alert analytics.',
    example: 'branch_1',
  })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({
    description:
      'Optional merchant user identifier filter for inventory alert analytics.',
    example: 'usr_merchant_1',
  })
  @IsOptional()
  @IsString()
  merchantUserId?: string;
}
