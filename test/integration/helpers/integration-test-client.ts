export type IntegrationHttpResponse<T = unknown> = {
  status: number;
  headers: Headers;
  body: T;
};

export class IntegrationTestClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultHeaders: Record<string, string> = {},
  ) {}

  withBearerToken(token: string): IntegrationTestClient {
    return new IntegrationTestClient(this.baseUrl, {
      ...this.defaultHeaders,
      authorization: `Bearer ${token}`,
    });
  }

  get<T = unknown>(
    path: string,
    options?: {
      headers?: Record<string, string>;
    },
  ): Promise<IntegrationHttpResponse<T>> {
    return this.request<T>('GET', path, options);
  }

  post<T = unknown>(
    path: string,
    options?: {
      body?: unknown;
      headers?: Record<string, string>;
    },
  ): Promise<IntegrationHttpResponse<T>> {
    return this.request<T>('POST', path, options);
  }

  patch<T = unknown>(
    path: string,
    options?: {
      body?: unknown;
      headers?: Record<string, string>;
    },
  ): Promise<IntegrationHttpResponse<T>> {
    return this.request<T>('PATCH', path, options);
  }

  delete<T = unknown>(
    path: string,
    options?: {
      body?: unknown;
      headers?: Record<string, string>;
    },
  ): Promise<IntegrationHttpResponse<T>> {
    return this.request<T>('DELETE', path, options);
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      headers?: Record<string, string>;
    },
  ): Promise<IntegrationHttpResponse<T>> {
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
      ? ((await response.json()) as T)
      : ((await response.text()) as T);

    return {
      status: response.status,
      headers: response.headers,
      body,
    };
  }
}
