import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { MenuItemDto } from '../dto/menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
import { MenusRepository } from '../repositories/menus.repository';
export declare class MenuItemInventoryService {
    private readonly prisma;
    private readonly menusRepository;
    private readonly auditService;
    private readonly notificationEventService;
    constructor(prisma: PrismaService, menusRepository: MenusRepository, auditService: AuditService, notificationEventService: NotificationEventService);
    adjustBranchItemInventory(currentUser: AuthenticatedUserEntity, item: MenuItemOwnershipRecord, payload: AdjustInventoryDto): Promise<MenuItemDto>;
    normalizeCreateInventory(payload: CreateMenuItemDto): Pick<Prisma.MenuItemUncheckedCreateInput, 'isStockTracked' | 'stockQuantity' | 'lowStockThreshold'>;
    normalizeUpdateInventory(payload: UpdateMenuItemDto, item: MenuItemOwnershipRecord): Pick<Prisma.MenuItemUpdateInput, 'isStockTracked' | 'stockQuantity' | 'lowStockThreshold'>;
    resolveNextItemStockTracking(payload: UpdateMenuItemDto, item: MenuItemOwnershipRecord): boolean;
    private assertInventoryValue;
    private assertStockTrackingEnabled;
    private assertItemDoesNotUseLots;
    private requireReasonCode;
    private normalizeOptionalString;
    private publishInventoryAlertIfNeeded;
    private resolveInventoryAttentionLevel;
}
