import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { ServerOptions } from 'socket.io';

import { AppLogger } from '../logging/app.logger';

/**
 * Socket.io adapter backed by Redis pub/sub.
 *
 * Without this, WebSocket events emitted on instance-A (e.g. order update)
 * never reach clients connected to instance-B. The Redis adapter broadcasts
 * events through a shared pub/sub channel so all instances see every emit.
 *
 * Usage (main.ts):
 *   const adapter = new RedisIoAdapter(app, redisUrl);
 *   await adapter.connectToRedis();
 *   app.useWebSocketAdapter(adapter);
 */
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  private readonly logger: AppLogger;

  constructor(
    app: INestApplicationContext,
    private readonly redisUrl: string,
  ) {
    super(app);
    this.logger = app.get(AppLogger);
  }

  async connectToRedis(): Promise<void> {
    const pubClient = new Redis(this.redisUrl);
    const subClient = pubClient.duplicate();

    // Attach persistent error listeners *before* racing for 'ready' —
    // callers (main.ts) apply a timeout around this method, and if that
    // timeout fires before these clients finish connecting, they keep
    // trying in the background. Without a listener already in place, a
    // later connection error on an orphaned client has nothing to catch it
    // and crashes the process (ioredis/Node EventEmitter behavior: an
    // 'error' event with zero listeners throws).
    for (const [name, client] of [['pub', pubClient], ['sub', subClient]] as const) {
      client.on('error', (error) => {
        this.logger.warnEvent(
          'WebSocket pub/sub Redis connection error.',
          { client: name, error: String(error) },
          'RedisIoAdapter',
        );
      });
    }

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        pubClient.once('ready', resolve);
        pubClient.once('error', reject);
      }),
      new Promise<void>((resolve, reject) => {
        subClient.once('ready', resolve);
        subClient.once('error', reject);
      }),
    ]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  override createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor !== null) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}
