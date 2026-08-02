import { HttpStatus } from '@nestjs/common';

import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';

describe('AppController', () => {
  const makeResponse = () => {
    const res: { status: jest.Mock } = { status: jest.fn() };
    res.status.mockReturnValue(res);
    return res as unknown as import('express').Response;
  };

  describe('ready', () => {
    it('does not set an error status when all checks pass', async () => {
      const appService = {
        ready: jest.fn().mockResolvedValue({
          status: 'ok',
          checks: { database: { status: 'up' }, cache: { status: 'up' }, queue: { status: 'up' } },
        }),
      } as unknown as jest.Mocked<AppService>;
      const controller = new AppController(appService);
      const res = makeResponse();

      const result = await controller.ready(res);

      expect(result.status).toBe('ok');
      expect(res.status).not.toHaveBeenCalled();
    });

    it('sets HTTP 503 when a component (e.g. Redis) is degraded', async () => {
      const appService = {
        ready: jest.fn().mockResolvedValue({
          status: 'degraded',
          checks: {
            database: { status: 'up' },
            cache: { status: 'down', error: 'ECONNREFUSED' },
            queue: { status: 'up' },
          },
        }),
      } as unknown as jest.Mocked<AppService>;
      const controller = new AppController(appService);
      const res = makeResponse();

      const result = await controller.ready(res);

      expect(result.status).toBe('degraded');
      expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    });
  });
});
