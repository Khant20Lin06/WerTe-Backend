import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterRiderDto {
  @ApiProperty({
    description: 'Rider phone number used for authentication.',
    example: '+959777777777',
  })
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message:
      'phone must be a valid phone number (7-15 digits, optional + prefix)',
  })
  @MaxLength(16)
  phone!: string;

  @ApiProperty({
    description: 'Password credential for the rider account.',
    example: 'Rider@1234',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password!: string;

  @ApiProperty({
    description: 'Rider display name.',
    example: 'Ko Aung',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  displayName!: string;

  @ApiProperty({
    description: 'Vehicle type used by the rider.',
    example: 'bike',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  vehicleType!: string;

  @ApiPropertyOptional({
    description: 'Initial operating township for the rider.',
    example: 'Kamaryut',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  currentTownship?: string;
}
