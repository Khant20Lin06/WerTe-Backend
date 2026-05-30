import { registerAs } from '@nestjs/config';

const redisConfig = registerAs('redis', () => ({
  url: process.env.REDIS_URL!,
  keyPrefix: process.env.REDIS_KEY_PREFIX ?? 'food-delivery',
}));

export type RedisConfig = ReturnType<typeof redisConfig>;

export default redisConfig;
