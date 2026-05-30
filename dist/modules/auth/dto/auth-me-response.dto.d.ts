import { UserRole } from '@prisma/client';
import { ActorContextDto } from './actor-context.dto';
export declare class AuthMeResponseDto {
    userId: string;
    sessionId: string;
    role: UserRole;
    actorContext: ActorContextDto;
}
