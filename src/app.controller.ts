import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';

@ApiTags('system')
@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    operationId: 'getPlatformHealth',
    summary: 'Get overall platform health',
  })
  @ApiOkResponse({
    description: 'Returns aggregated application health and readiness status.',
  })
  @Get('health')
  async health() {
    return this.appService.health();
  }

  @ApiOperation({
    operationId: 'getPlatformLiveness',
    summary: 'Get liveness status',
  })
  @ApiOkResponse({
    description: 'Returns simple process liveness status.',
  })
  @Get('health/live')
  live() {
    return this.appService.live();
  }

  @ApiOperation({
    operationId: 'getPlatformReadiness',
    summary: 'Get readiness status',
  })
  @ApiOkResponse({
    description: 'Returns readiness checks including database connectivity.',
  })
  @Get('health/ready')
  async ready() {
    return this.appService.ready();
  }
}
