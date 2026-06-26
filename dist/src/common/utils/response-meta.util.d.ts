type HttpLikeRequest = {
    headers?: Record<string, string | string[] | undefined>;
    requestId?: string;
    id?: string;
};
export declare function buildResponseMeta(request?: HttpLikeRequest): {
    requestId: string;
    timestamp: string;
};
export {};
