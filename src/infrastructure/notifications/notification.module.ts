import { Global, Module } from '@nestjs/common';

import { FcmService } from './fcm.service';
import { SmsService } from './sms.service';

@Global()
@Module({
  providers: [FcmService, SmsService],
  exports: [FcmService, SmsService],
})
export class NotificationModule {}
