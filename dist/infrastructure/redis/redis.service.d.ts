import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService extends Redis {
    constructor(configService: ConfigService);
}
