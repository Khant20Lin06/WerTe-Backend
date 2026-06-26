export type SuccessResponse<T> = {
    success: true;
    data: T;
    meta: {
        requestId: string;
        timestamp: string;
    };
};
export type ErrorResponse = {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta: {
        requestId: string;
        timestamp: string;
    };
};
export declare function isResponseEnvelope(value: unknown): value is SuccessResponse<unknown> | ErrorResponse;
