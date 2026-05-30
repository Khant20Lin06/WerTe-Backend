import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class WebsocketAuthGuard implements CanActivate {
    canActivate(_context: ExecutionContext): boolean;
}
