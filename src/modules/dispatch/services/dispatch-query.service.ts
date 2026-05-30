import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import {
  buildDispatchQueueEntry,
  DispatchQueueEntryEntity,
  DispatchQueueEntryRecord,
} from '../entities/dispatch-queue-entry.entity';
import { DispatchRepository } from '../repositories/dispatch.repository';

@Injectable()
export class DispatchQueryService {
  constructor(private readonly dispatchRepository: DispatchRepository) {}

  buildDispatchQueueEntry(
    entry: DispatchQueueEntryRecord,
  ): DispatchQueueEntryEntity {
    return buildDispatchQueueEntry(entry);
  }

  async listQueueEntries(): Promise<DispatchQueueEntryEntity[]> {
    const entries = await this.dispatchRepository.findQueueEntries();

    return entries.map((entry) => this.buildDispatchQueueEntry(entry));
  }

  async getQueueEntry(orderId: string): Promise<DispatchQueueEntryEntity> {
    const entry = await this.dispatchRepository.findQueueEntryByOrderId(orderId);

    if (entry === null) {
      throw new AppException(
        'Dispatch queue entry was not found.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    return this.buildDispatchQueueEntry(entry);
  }
}
