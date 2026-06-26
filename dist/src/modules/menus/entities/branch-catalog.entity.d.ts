import { BranchStatus, ItemOptionGroupKind, Prisma } from '@prisma/client';
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
    storeTypes: {
        where: {
            status: "APPROVED";
            storeType: {
                isActive: true;
                deletedAt: null;
            };
        };
        orderBy: [{
            isPrimary: "desc";
        }, {
            sortOrder: "asc";
        }, {
            createdAt: "asc";
        }];
        include: {
            storeType: {
                select: {
                    id: true;
                    code: true;
                    name: true;
                    sortOrder: true;
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
            storeTypes: {
                include: {
                    storeType: {
                        select: {
                            id: true;
                            code: true;
                            name: true;
                            sortOrder: true;
                        };
                    };
                };
                orderBy: [{
                    storeTypeId: "asc";
                }];
            };
            menuItems: {
                orderBy: [{
                    sortOrder: "asc";
                }, {
                    createdAt: "asc";
                }];
                include: {
                    storeTypes: {
                        include: {
                            storeType: {
                                select: {
                                    id: true;
                                    code: true;
                                    name: true;
                                    sortOrder: true;
                                };
                            };
                        };
                        orderBy: [{
                            storeTypeId: "asc";
                        }];
                    };
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
                    variantCombinations: {
                        orderBy: [{
                            sortOrder: "asc";
                        }, {
                            createdAt: "asc";
                        }];
                        include: {
                            optionLinks: {
                                include: {
                                    itemOption: {
                                        select: {
                                            id: true;
                                            name: true;
                                            sortOrder: true;
                                            isActive: true;
                                            group: {
                                                select: {
                                                    id: true;
                                                    name: true;
                                                    sortOrder: true;
                                                    isActive: true;
                                                };
                                            };
                                        };
                                    };
                                };
                                orderBy: [{
                                    itemOptionId: "asc";
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
            storeTypes: {
                include: {
                    storeType: {
                        select: {
                            id: true;
                            code: true;
                            name: true;
                            sortOrder: true;
                        };
                    };
                };
                orderBy: [{
                    storeTypeId: "asc";
                }];
            };
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
            variantCombinations: {
                orderBy: [{
                    sortOrder: "asc";
                }, {
                    createdAt: "asc";
                }];
                include: {
                    optionLinks: {
                        include: {
                            itemOption: {
                                select: {
                                    id: true;
                                    name: true;
                                    sortOrder: true;
                                    isActive: true;
                                    group: {
                                        select: {
                                            id: true;
                                            name: true;
                                            sortOrder: true;
                                            isActive: true;
                                        };
                                    };
                                };
                            };
                        };
                        orderBy: [{
                            itemOptionId: "asc";
                        }];
                    };
                };
            };
        };
    };
    staffAssignments: {
        select: {
            staffId: true;
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
    isStockTracked: boolean;
    stockQuantity?: number | null;
    lowStockThreshold?: number | null;
    isInStock: boolean;
    isLowStock: boolean;
    sortOrder: number;
    isActive: boolean;
}
export declare class CatalogScopedStoreTypeEntity {
    id: string;
    code: string;
    name: string;
    sortOrder: number;
}
export declare class CatalogOptionGroupEntity {
    optionGroupId: string;
    name: string;
    description?: string | null;
    kind: ItemOptionGroupKind;
    minSelect: number;
    maxSelect: number;
    sortOrder: number;
    isActive: boolean;
    options: CatalogOptionEntity[];
}
export declare class CatalogVariantCombinationSelectionEntity {
    optionId: string;
    optionName: string;
    optionSortOrder: number;
    optionGroupId: string;
    optionGroupName: string;
    optionGroupSortOrder: number;
}
export declare class CatalogVariantCombinationEntity {
    combinationId: string;
    name: string;
    sku?: string | null;
    isStockTracked: boolean;
    stockQuantity?: number | null;
    lowStockThreshold?: number | null;
    isInStock: boolean;
    isLowStock: boolean;
    sortOrder: number;
    isActive: boolean;
    selectedOptions: CatalogVariantCombinationSelectionEntity[];
}
export declare class CatalogMenuItemEntity {
    itemId: string;
    categoryId?: string | null;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    imageUrls: string[];
    sku?: string | null;
    barcode?: string | null;
    brand?: string | null;
    attributes?: Record<string, unknown> | null;
    basePrice: string;
    isStockTracked: boolean;
    stockQuantity?: number | null;
    lowStockThreshold?: number | null;
    isInStock: boolean;
    isLowStock: boolean;
    sortOrder: number;
    isAvailable: boolean;
    scopedStoreTypes: CatalogScopedStoreTypeEntity[];
    optionGroups: CatalogOptionGroupEntity[];
    variantCombinations: CatalogVariantCombinationEntity[];
}
export declare class CatalogMenuCategoryEntity {
    categoryId: string;
    name: string;
    description?: string | null;
    sortOrder: number;
    isActive: boolean;
    scopedStoreTypes: CatalogScopedStoreTypeEntity[];
    items: CatalogMenuItemEntity[];
}
export declare class BranchCatalogEntity {
    branchId: string;
    merchantId: string;
    merchantUserId: string;
    branchName: string;
    township: string;
    branchStatus: BranchStatus;
    approvedStoreTypes: CatalogScopedStoreTypeEntity[];
    categories: CatalogMenuCategoryEntity[];
    uncategorizedItems: CatalogMenuItemEntity[];
}
type BuildBranchCatalogOptions = {
    activeOnly?: boolean;
    storeTypeCode?: string;
};
export declare function buildBranchCatalog(branch: BranchCatalogRecord, options?: BuildBranchCatalogOptions): BranchCatalogEntity;
export {};
