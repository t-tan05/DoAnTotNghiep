import { ListQuery } from "#types/pagination.type";

export type UserSortBy =
    | "name"
    | "email"
    | "status"
    | "verified";

export type UserRoleFilter = "EMPLOYEE" | "CUSTOMER";
export type UserStatusFilter = "ACTIVE" | "LOCKED";

export type UserListQuery = ListQuery<UserSortBy> & {
    role?: UserRoleFilter;
    status?: UserStatusFilter;
    verified?: boolean;
    mustChangePassword?: boolean;
};