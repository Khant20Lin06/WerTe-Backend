import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { UserIdentityRecord } from '../entities/actor-context.entity';
export declare class UsersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<UserIdentityRecord | null>;
    findByPhone(phone: string): Promise<UserIdentityRecord | null>;
}
