type RequestContextStore = {
    requestId: string;
};
export declare class RequestContextService {
    private readonly storage;
    run<T>(context: RequestContextStore, callback: () => T): T;
    getRequestId(): string | undefined;
}
export {};
