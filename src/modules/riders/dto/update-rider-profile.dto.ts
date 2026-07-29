import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRiderProfileDto {
  @ApiPropertyOptional({
    description: 'Rider display name.',
    example: 'Ko Aung',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Vehicle type used by the rider.',
    example: 'bike',
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  vehicleType?: string;

  @ApiPropertyOptional({
    description: 'Vehicle plate number.',
    example: '5J-1234',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  plateNumber?: string;

  @ApiPropertyOptional({
    description: 'Current operating township for dispatch context.',
    example: 'Kamaryut',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  currentTownship?: string;
}
