import type { ListMeta, ListQuery } from "./admin-table.type";

export type UpdateProfilePayload = {
    name: string;
};

export type ChangePasswordPayload = {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
};

export type UserStatus = "ACTIVE" | "LOCKED";
export type UserRole = "ADMIN" | "EMPLOYEE" | "CUSTOMER";
export type UserSortBy = "name" | "email" | "status" | "verified";

export type AdminUser = {
    user_id: string;
    email: string;
    name: string;
    verified: boolean;
    must_change_password: boolean;
    status: UserStatus;
    locked_reason?: string | null;
    locked_at?: string | null;
    users_roles: Array<{
        role_name: UserRole | string;
    }>;
};

export type UserListQuery = ListQuery<UserSortBy> & {
    role?: Exclude<UserRole, "ADMIN">;
    status?: UserStatus;
    verified?: boolean;
    mustChangePassword?: boolean;
};

export type UserListResponse = {
    users: AdminUser[];
    meta: ListMeta<UserSortBy> & {
        filters?: {
            role?: UserListQuery["role"];
            status?: UserStatus;
            verified?: boolean;
            mustChangePassword?: boolean;
        };
    };
};

export type CreateEmployeePayload = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export type LockUserPayload = {
    reason?: string;
};
