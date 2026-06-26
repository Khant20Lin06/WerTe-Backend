import { Module } from '@nestjs/common';

import { AdminDlqController } from './controllers/admin-dlq.controller';

@Module({
  controllers: [AdminDlqController],
})
export class AdminOpsModule {}
