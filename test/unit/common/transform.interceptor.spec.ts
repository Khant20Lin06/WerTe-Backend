import { ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';

import { TransformInterceptor } from '../../../src/common/interceptors/transform.interceptor';

describe('TransformInterceptor', () => {
  it('wraps successful responses in the standard envelope', async () => {
    const interceptor = new TransformInterceptor();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-request-id': 'req_123',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await lastValueFrom(
      interceptor.intercept(context, {
        handle: () => of({ status: 'ok' }),
      }),
    );

    expect(result).toEqual({
      success: true,
      data: {
        status: 'ok',
      },
      meta: {
        requestId: 'req_123',
        timestamp: expect.any(String),
      },
    });
  });

  it('does not double-wrap a prebuilt response envelope', async () => {
    const interceptor = new TransformInterceptor();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await lastValueFrom(
      interceptor.intercept(context, {
        handle: () =>
          of({
            success: true as const,
            data: { ok: true },
            meta: {
              requestId: 'req_existing',
              timestamp: '2026-04-18T10:00:00.000Z',
            },
          }),
      }),
    );

    expect(result).toEqual({
      success: true,
      data: { ok: true },
      meta: {
        requestId: 'req_existing',
        timestamp: '2026-04-18T10:00:00.000Z',
      },
    });
  });
});
