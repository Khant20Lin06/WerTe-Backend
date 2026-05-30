import { RequestContextMiddleware } from '../../../src/common/middleware/request-context.middleware';
import { RequestContextService } from '../../../src/infrastructure/logging/request-context.service';

describe('RequestContextMiddleware', () => {
  it('propagates request id from the incoming header', () => {
    const contextService = new RequestContextService();
    const middleware = new RequestContextMiddleware(contextService);
    const request = {
      header: jest.fn().mockReturnValue('req_789'),
    };
    const response = {
      setHeader: jest.fn(),
    };
    const next = jest.fn(() => {
      expect(contextService.getRequestId()).toBe('req_789');
    });

    middleware.use(
      request as unknown as Parameters<RequestContextMiddleware['use']>[0],
      response as unknown as Parameters<RequestContextMiddleware['use']>[1],
      next as unknown as Parameters<RequestContextMiddleware['use']>[2],
    );

    expect(response.setHeader).toHaveBeenCalledWith('x-request-id', 'req_789');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
