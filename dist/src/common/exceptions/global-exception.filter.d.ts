import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { AppLogger } from '../../infrastructure/logging/app.logger';
export declare class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger?;
    constructor(logger?: AppLogger | undefined);
    catch(exception: unknown, host: ArgumentsHost): void;
    private normalizePrismaKnownRequestError;
    private normalizeHttpException;
    private logNormalizedError;
}
