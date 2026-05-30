import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional({
    description: 'Customer display name.',
    example: 'Mg Mg',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Customer avatar URL.',
    example: 'https://cdn.example.com/avatar/customer-1.png',
    maxLength: 2048,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatarUrl?: string;
}
