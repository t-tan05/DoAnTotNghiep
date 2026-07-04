import { api } from "./api";
import type { BackendSuccess } from "../types/api.type";
import type {
    AdminUser,
    CreateEmployeePayload,
    UpdateProfilePayload,
    ChangePasswordPayload,
    LockUserPayload,
    UserListQuery,
    UserListResponse,
} from "../types/user.type";

export const userService = {
    getAll: async (query: UserListQuery) => {
        const { data } = await api.get<BackendSuccess<UserListResponse>>("/users", {
            params: query,
        });

        return data.data;
    },

    createEmployee: async (payload: CreateEmployeePayload) => {
        const { data } = await api.post<BackendSuccess<{ user: AdminUser }>>("/users/employees", payload);

        return data.data;
    },

    lock: async (userId: string, payload: LockUserPayload) => {
        const { data } = await api.patch<BackendSuccess<{ lockUser: AdminUser }>>(`/users/${userId}/lock`, payload);

        return data.data;
    },

    unlock: async (userId: string) => {
        const { data } = await api.patch<BackendSuccess<{ unlockUser: AdminUser }>>(`/users/${userId}/unlock`);

        return data.data;
    },

    remove: async (userId: string) => {
        const { data } = await api.delete<BackendSuccess>(`/users/${userId}`);

        return data;
    },

    updateProfile: (payload: UpdateProfilePayload) => {
        return api.patch("/users/me", payload);
    },

    changePassword: (payload: ChangePasswordPayload) => {
        return api.patch("/users/me/password", payload);
    },
};

