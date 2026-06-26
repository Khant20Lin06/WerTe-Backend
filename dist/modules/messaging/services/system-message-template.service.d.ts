import { SystemMessageCode } from '@prisma/client';
import { SystemMessageTemplateRepository } from '../repositories/system-message-template.repository';
export declare class SystemMessageTemplateService {
    private readonly templateRepository;
    constructor(templateRepository: SystemMessageTemplateRepository);
    saveTemplateOverride(payload: {
        code: SystemMessageCode;
        label: string;
        bodyTemplate: string;
        isActive?: boolean;
    }): import(".prisma/client").Prisma.Prisma__SystemMessageTemplateClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: import(".prisma/client").$Enums.SystemMessageCode;
        isActive: boolean;
        label: string;
        bodyTemplate: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    render(code: SystemMessageCode, variables: Record<string, string | null | undefined>): Promise<string>;
    private interpolate;
}
