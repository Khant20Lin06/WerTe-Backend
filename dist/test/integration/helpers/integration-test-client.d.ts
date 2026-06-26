export type IntegrationHttpResponse<T = unknown> = {
    status: number;
    headers: Headers;
    body: T;
};
export declare class IntegrationTestClient {
    private readonly baseUrl;
    private readonly defaultHeaders;
    constructor(baseUrl: string, defaultHeaders?: Record<string, string>);
    withBearerToken(token: string): IntegrationTestClient;
    get<T = unknown>(path: string, options?: {
        headers?: Record<string, string>;
    }): Promise<IntegrationHttpResponse<T>>;
    post<T = unknown>(path: string, options?: {
        body?: unknown;
        headers?: Record<string, string>;
    }): Promise<IntegrationHttpResponse<T>>;
    patch<T = unknown>(path: string, options?: {
        body?: unknown;
        headers?: Record<string, string>;
    }): Promise<IntegrationHttpResponse<T>>;
    delete<T = unknown>(path: string, options?: {
        body?: unknown;
        headers?: Record<string, string>;
    }): Promise<IntegrationHttpResponse<T>>;
    private request;
}
