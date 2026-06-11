import { ListQuery, SortOrder } from "#types/pagination.type";

type ParseListQueryOptions<TSortBy extends string> = {
    query: Record<string, unknown>;
    allowedSortFields: readonly TSortBy[];
    defaultSortBy: TSortBy;
};

export const parseListQuery = <TSortBy extends string>({
    query,
    allowedSortFields,
    defaultSortBy,
}: ParseListQueryOptions<TSortBy>): ListQuery<TSortBy> => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

    const search = typeof query.search === "string" ? query.search.trim() : "";
    const sortBy = typeof query.sortBy === "string" && allowedSortFields.includes(query.sortBy as TSortBy)
                ? query.sortBy as TSortBy : defaultSortBy;

    const sortOrder: SortOrder = query.sortOrder === "desc" ? "desc" : "asc";

    return {
        page,
        limit,
        search: search || undefined,
        sortBy,
        sortOrder,
    };
};

