import { BranchStatus, Prisma } from '@prisma/client';
export declare const branchCatalogInclude: {
    merchant: {
        select: {
            id: true;
            name: true;
            status: true;
            user: {
                select: {
                    id: true;
                    phone: true;
                    role: true;
                    status: true;
                };
            };
        };
    };
    menuCategories: {
        orderBy: [{
            sortOrder: "asc";
        }, {
            createdAt: "asc";
        }];
        include: {
            menuItems: {
                orderBy: [{
                    sortOrder: "asc";
                }, {
                    createdAt: "asc";
                }];
                include: {
                    optionGroups: {
                        orderBy: [{
                            sortOrder: "asc";
                        }, {
                            createdAt: "asc";
                        }];
                        include: {
                            options: {
                                orderBy: [{
                                    sortOrder: "asc";
                                }, {
                                    createdAt: "asc";
                                }];
                            };
                        };
                    };
                };
            };
        };
    };
    menuItems: {
        where: {
            categoryId: null;
        };
        orderBy: [{
            sortOrder: "asc";
        }, {
            createdAt: "asc";
        }];
        include: {
            optionGroups: {
                orderBy: [{
                    sortOrder: "asc";
                }, {
                    createdAt: "asc";
                }];
                include: {
                    options: {
                        orderBy: [{
                            sortOrder: "asc";
                        }, {
                            createdAt: "asc";
                        }];
                    };
                };
            };
        };
    };
};
export type BranchCatalogRecord = Prisma.BranchGetPayload<{
    include: typeof branchCatalogInclude;
}>;
export declare class CatalogOptionEntity {
    optionId: string;
    name: string;
    priceDelta: string;
    sortOrder: number;
    isActive: boolean;
}
export declare class CatalogOptionGroupEntity {
    optionGroupId: string;
    name: string;
    description?: string | null;
    minSelect: number;
    maxSelect: number;
    sortOrder: number;
    isActive: boolean;
    options: CatalogOptionEntity[];
}
export declare class CatalogMenuItemEntity {
    itemId: string;
    categoryId?: string | null;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    basePrice: string;
    sortOrder: number;
    isAvailable: boolean;
    optionGroups: CatalogOptionGroupEntity[];
}
export declare class CatalogMenuCategoryEntity {
    categoryId: string;
    name: string;
    description?: string | null;
    sortOrder: number;
    isActive: boolean;
    items: CatalogMenuItemEntity[];
}
export declare class BranchCatalogEntity {
    branchId: string;
    merchantId: string;
    merchantUserId: string;
    branchName: string;
    township: string;
    branchStatus: BranchStatus;
    categories: CatalogMenuCategoryEntity[];
    uncategorizedItems: CatalogMenuItemEntity[];
}
type BuildBranchCatalogOptions = {
    activeOnly?: boolean;
};
export declare function buildBranchCatalog(branch: BranchCatalogRecord, options?: BuildBranchCatalogOptions): BranchCatalogEntity;
export {};
