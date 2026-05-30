import { createIntegrationApp } from './helpers/create-integration-app';

describe('System health integration', () => {
  it('serves liveness and readiness routes through the configured global prefix', async () => {
    const harness = await createIntegrationApp();

    try {
      const liveResponse = await harness.client.get('/api/v1/health/live');
      const readyResponse = await harness.client.get('/api/v1/health/ready');

      expect(liveResponse.status).toBe(200);
      expect(liveResponse.body).toMatchObject({
        success: true,
        data: {
          status: 'ok',
        },
      });

      expect(readyResponse.status).toBe(200);
      expect(readyResponse.body).toMatchObject({
        success: true,
        data: {
          status: 'ok',
          checks: {
            database: {
              status: 'up',
            },
          },
        },
      });
      expect(harness.prisma.checkHealth).toHaveBeenCalled();
    } finally {
      await harness.close();
    }
  });
});
