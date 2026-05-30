import { Injectable } from '@nestjs/common';
import { SystemMessageCode } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class SystemMessageTemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByCode(code: SystemMessageCode) {
    return this.prisma.systemMessageTemplate.findFirst({
      where: {
        code,
        isActive: true,
      },
    });
  }

  upsertTemplate(payload: {
    code: SystemMessageCode;
    label: string;
    bodyTemplate: string;
    isActive?: boolean;
  }) {
    return this.prisma.systemMessageTemplate.upsert({
      where: {
        code: payload.code,
      },
      create: {
        code: payload.code,
        label: payload.label,
        bodyTemplate: payload.bodyTemplate,
        isActive: payload.isActive ?? true,
      },
      update: {
        label: payload.label,
        bodyTemplate: payload.bodyTemplate,
        isActive: payload.isActive ?? true,
      },
    });
  }
}
