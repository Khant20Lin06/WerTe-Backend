"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationTestClient = void 0;
class IntegrationTestClient {
    constructor(baseUrl, defaultHeaders = {}) {
        this.baseUrl = baseUrl;
        this.defaultHeaders = defaultHeaders;
    }
    withBearerToken(token) {
        return new IntegrationTestClient(this.baseUrl, {
            ...this.defaultHeaders,
            authorization: `Bearer ${token}`,
        });
    }
    get(path, options) {
        return this.request('GET', path, options);
    }
    post(path, options) {
        return this.request('POST', path, options);
    }
    patch(path, options) {
        return this.request('PATCH', path, options);
    }
    delete(path, options) {
        return this.request('DELETE', path, options);
    }
    async request(method, path, options) {
        const headers = {
            ...this.defaultHeaders,
            ...options?.headers,
        };
        const hasBody = options?.body !== undefined;
        const response = await fetch(`${this.baseUrl}${path}`, {
            method,
            headers: hasBody
                ? {
                    'content-type': 'application/json',
                    ...headers,
                }
                : headers,
            body: hasBody ? JSON.stringify(options?.body) : undefined,
        });
        const contentType = response.headers.get('content-type') ?? '';
        const body = contentType.includes('application/json')
            ? (await response.json())
            : (await response.text());
        return {
            status: response.status,
            headers: response.headers,
            body,
        };
    }
}
exports.IntegrationTestClient = IntegrationTestClient;
//# sourceMappingURL=integration-test-client.js.map