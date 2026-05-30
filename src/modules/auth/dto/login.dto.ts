import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Actor phone number used for authentication.',
    example: '09123456789',
  })
  @IsString()
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
