export declare class ResponseMetaDto {
    requestId: string;
    timestamp: string;
}
export declare class BaseResponseDto<T> {
    success: true;
    data: T;
    meta: ResponseMetaDto;
}
export declare class BaseErrorResponseDto {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta: ResponseMetaDto;
}
export declare class PaginatedMetaDto extends ResponseMetaDto {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
}
