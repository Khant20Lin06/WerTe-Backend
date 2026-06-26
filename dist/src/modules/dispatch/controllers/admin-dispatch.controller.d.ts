import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { OrderDetailDto } from '../../orders/dto/order-detail.dto';
import { AssignRiderDto } from '../dto/assign-rider.dto';
import { DispatchAssignmentService } from '../services/dispatch-assignment.service';
export declare class AdminDispatchController {
    private readonly dispatchAssignmentService;
    constructor(dispatchAssignmentService: DispatchAssignmentService);
    assignRider(currentUser: AuthenticatedUserEntity, orderId: string, body: AssignRiderDto): Promise<OrderDetailDto>;
}
