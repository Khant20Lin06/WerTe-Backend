import { SystemMessageCode } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
export declare class SystemMessageTemplateRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findActiveByCode(code: SystemMessageCode): import(".prisma/client").Prisma.Prisma__SystemMessageTemplateClient<{
        code: import(".prisma/client").$Enums.SystemMessageCode;
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        label: string;
        bodyTemplate: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    upsertTemplate(payload: {
        code: SystemMessageCode;
        label: string;
        bodyTemplate: string;
        isActive?: boolean;
    }): import(".prisma/client").Prisma.Prisma__SystemMessageTemplateClient<{
        code: import(".prisma/client").$Enums.SystemMessageCode;
        id: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        label: string;
        bodyTemplate: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
