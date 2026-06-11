export type SortOrder = "asc" | "desc";

export type ListQuery<TSortBy extends string> = {
    page: number;
    limit: number;
    search?: string;
    sortBy: TSortBy;
    sortOrder: SortOrder;
};

export type ListMeta<TSortBy extends string> = {
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
    sort: {
        sortBy: TSortBy;
        sortOrder: SortOrder;
    };
    search?: string;
};