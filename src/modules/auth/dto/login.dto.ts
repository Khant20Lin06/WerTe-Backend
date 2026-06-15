import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Actor phone number used for authentication.',
    example: '+959123456789',
  })
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'phone must be a valid phone number (7-15 digits, optional + prefix)' })
  @MaxLength(16)
  phone!: string;

  @ApiProperty({
    description: 'Password credential for the actor account.',
    example: 'strong-password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
