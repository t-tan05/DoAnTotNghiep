export const parseListQuery = ({ query, allowedSortFields, defaultSortBy, }) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const search = typeof query.search === "string" ? query.search.trim() : "";
    const sortBy = typeof query.sortBy === "string" && allowedSortFields.includes(query.sortBy)
        ? query.sortBy : defaultSortBy;
    const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";
    return {
        page,
        limit,
        search: search || undefined,
        sortBy,
        sortOrder,
    };
};
