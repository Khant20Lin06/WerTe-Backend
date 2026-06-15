import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseMetaDto {
  @ApiProperty({ example: 'req_01hwz3k2x8f9g' })
  requestId!: string;

  @ApiProperty({ example: '2026-06-01T10:00:00.000Z' })
  timestamp!: string;
}

export class BaseResponseDto<T> {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty()
  data!: T;

  @ApiProperty({ type: () => ResponseMetaDto })
  meta!: ResponseMetaDto;
}

export class BaseErrorResponseDto {
  @ApiProperty({ example: false })
  success!: false;

  @ApiProperty({
    example: {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: null,
    },
  })
  error!: {
    code: string;
    message: string;
    details?: unknown;
  };

  @ApiProperty({ type: () => ResponseMetaDto })
  meta!: ResponseMetaDto;
}

export class PaginatedMetaDto extends ResponseMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;

  @ApiPropertyOptional({ example: true })
  hasNext?: boolean;

  @ApiPropertyOptional({ example: false })
  hasPrev?: boolean;
}
