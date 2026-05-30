import { HttpStatus } from '@nestjs/common';

import { DispatchRepository } from '../../../../src/modules/dispatch/repositories/dispatch.repository';
import { DispatchQueryService } from '../../../../src/modules/dispatch/services/dispatch-query.service';

describe('DispatchQueryService', () => {
  const makeService = () => {
    const repository = {
      findQueueEntries: jest.fn(),
      findQueueEntryByOrderId: jest.fn(),
    } as unknown as jest.Mocked<DispatchRepository>;
    const service = new DispatchQueryService(repository);

    return { repository, service };
  };

  it('returns an empty queue when no dispatch candidates are found', async () => {
    const { repository, service } = makeService();
    repository.findQueueEntries.mockResolvedValue([]);

    await expect(service.listQueueEntries()).resolves.toEqual([]);
  });

  it('throws not found when a specific queue entry cannot be resolved', async () => {
    const { repository, service } = makeService();
    repository.findQueueEntryByOrderId.mockResolvedValue(null);

    await expect(service.getQueueEntry('order_missing')).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
    });
  });
});
