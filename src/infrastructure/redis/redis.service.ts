import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis {
  constructor(configService: ConfigService) {
    super(configService.getOrThrow<string>('redis.url'), {
      keyPrefix: configService.get<string>('redis.keyPrefix'),
    });
  }
}
