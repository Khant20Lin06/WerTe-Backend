import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
export declare class ZonePolicyService {
    canManageZones(currentUser: AuthenticatedUserEntity): boolean;
    canReadActiveZones(currentUser: AuthenticatedUserEntity): boolean;
}
