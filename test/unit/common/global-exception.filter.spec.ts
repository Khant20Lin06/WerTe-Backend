import { ArgumentsHost, HttpStatus } from '@nestjs/common';

import { AppException } from '../../../src/common/exceptions/app.exception';
import { GlobalExceptionFilter } from '../../../src/common/exceptions/global-exception.filter';

describe('GlobalExceptionFilter', () => {
  it('serializes AppException into the standard error envelope', () => {
    const filter = new GlobalExceptionFilter();
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const request = {
      headers: {
        'x-request-id': 'req_456',
      },
      method: 'GET',
      url: '/api/v1/test',
    };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(
      new AppException('Missing resource.', HttpStatus.NOT_FOUND),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Missing resource.',
        details: undefined,
      },
      meta: {
        requestId: 'req_456',
        timestamp: expect.any(String),
      },
    });
  });
});
