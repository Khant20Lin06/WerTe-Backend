import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../../common/decorators/roles.decorator';
import { DlqEntry, DlqService } from '../../../infrastructure/queue/dlq.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';

@ApiTags('admin-dlq')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/queue/dlq')
export class AdminDlqController {
  constructor(
    private readonly dlqService: DlqService,
    private readonly queueService: QueueService,
  ) {}

  @ApiOperation({
    operationId: 'adminListDlqJobs',
    summary: 'List all dead-letter queue jobs with optional queue/job filter',
  })
  @ApiQuery({ name: 'queueName', required: false })
  @ApiQuery({ name: 'jobName', required: false })
  @ApiOkResponse({ description: 'Returns DLQ entries, newest first.' })
  @Get()
  async list(
    @Query('queueName') queueName?: string,
    @Query('jobName') jobName?: string,
  ): Promise<DlqEntry[]> {
    return this.dlqService.list(queueName, jobName);
  }

  @ApiOperation({
    operationId: 'adminGetDlqCount',
    summary: 'Count dead-letter queue jobs',
  })
  @ApiQuery({ name: 'queueName', required: false })
  @ApiQuery({ name: 'jobName', required: false })
  @ApiOkResponse({ description: 'Returns total DLQ job count.' })
  @Get('count')
  async count(
    @Query('queueName') queueName?: string,
    @Query('jobName') jobName?: string,
  ): Promise<{ count: number }> {
    return { count: await this.dlqService.count(queueName, jobName) };
  }

  @ApiOperation({
    operationId: 'adminRetryDlqJob',
    summary: 'Re-enqueue a failed job from the DLQ back into its original queue',
  })
  @ApiParam({ name: 'queueName' })
  @ApiParam({ name: 'jobName' })
  @ApiParam({ name: 'jobId' })
  @ApiOkResponse({ description: 'Job re-enqueued into the original queue.' })
  @Post(':queueName/:jobName/:jobId/retry')
  async retry(
    @Param('queueName') queueName: string,
    @Param('jobName') jobName: string,
    @Param('jobId') jobId: string,
  ): Promise<DlqEntry> {
    const entries = await this.dlqService.list(queueName, jobName);
    const entry = entries.find((e) => e.id === jobId);

    if (entry === undefined) {
      throw new NotFoundException(`DLQ entry ${jobId} not found.`);
    }

    await this.queueService.add(queueName, jobName, entry.payload);
    await this.dlqService.remove(queueName, jobName, jobId);

    return entry;
  }

  @ApiOperation({
    operationId: 'adminDeleteDlqJob',
    summary: 'Permanently delete a job from the DLQ',
  })
  @ApiParam({ name: 'queueName' })
  @ApiParam({ name: 'jobName' })
  @ApiParam({ name: 'jobId' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':queueName/:jobName/:jobId')
  async remove(
    @Param('queueName') queueName: string,
    @Param('jobName') jobName: string,
    @Param('jobId') jobId: string,
  ): Promise<void> {
    const removed = await this.dlqService.remove(queueName, jobName, jobId);
    if (!removed) {
      throw new NotFoundException(`DLQ entry ${jobId} not found.`);
    }
  }

  @ApiOperation({
    operationId: 'adminPruneDlqJobs',
    summary: 'Prune DLQ entries older than 30 days',
  })
  @ApiOkResponse({ description: 'Returns number of entries removed.' })
  @Post('prune')
  async prune(): Promise<{ removed: number }> {
    return { removed: await this.dlqService.pruneExpired() };
  }
}
