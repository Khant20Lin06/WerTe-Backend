import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterCustomerDto {
  @ApiProperty({
    description: 'Customer phone number used for authentication.',
    example: '+959123456789',
  })
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message:
      'phone must be a valid phone number (7-15 digits, optional + prefix)',
  })
  @MaxLength(16)
  phone!: string;

  @ApiProperty({
    description: 'Password credential for the customer account.',
    example: 'Customer@1234',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({
    description: 'Customer display name.',
    example: 'Mg Mg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Customer avatar URL.',
    example: 'https://cdn.example.com/avatar/customer-1.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;
}
