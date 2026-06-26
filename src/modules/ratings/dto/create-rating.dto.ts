import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RaterType, RatingTargetType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ enum: RatingTargetType })
  @IsEnum(RatingTargetType)
  targetType!: RatingTargetType;

  @ApiProperty()
  @IsString()
  targetId!: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  score!: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}

export class RatingDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderId!: string;

  @ApiProperty({ enum: RaterType })
  raterType!: RaterType;

  @ApiProperty()
  raterId!: string;

  @ApiProperty({ enum: RatingTargetType })
  targetType!: RatingTargetType;

  @ApiProperty()
  targetId!: string;

  @ApiProperty()
  score!: number;

  @ApiPropertyOptional()
  comment?: string | null;

  @ApiProperty()
  createdAt!: Date;
}

export function toRatingDto(r: {
  id: string;
  orderId: string;
  raterType: RaterType;
  raterId: string;
  targetType: RatingTargetType;
  targetId: string;
  score: number;
  comment: string | null;
  createdAt: Date;
}): RatingDto {
  return {
    id: r.id,
    orderId: r.orderId,
    raterType: r.raterType,
    raterId: r.raterId,
    targetType: r.targetType,
    targetId: r.targetId,
    score: r.score,
    comment: r.comment,
    createdAt: r.createdAt,
  };
}
