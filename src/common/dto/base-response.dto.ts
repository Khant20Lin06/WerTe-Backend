export class ResponseMetaDto {
  requestId!: string;
  timestamp!: string;
}

export class BaseResponseDto<T> {
  success!: true;
  data!: T;
  meta!: ResponseMetaDto;
}

export class BaseErrorResponseDto {
  success!: false;
  error!: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta!: ResponseMetaDto;
}
