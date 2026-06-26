import { OnModuleInit } from '@nestjs/common';
import { AutoDispatchService } from './services/auto-dispatch.service';
export declare class DispatchModule implements OnModuleInit {
    private readonly autoDispatchService;
    constructor(autoDispatchService: AutoDispatchService);
    onModuleInit(): void;
}
