import { api } from "./api";
import type {
    UpdateProfilePayload,
    ChangePasswordPayload,
} from "../types/user.type";

export const userService = {
    updateProfile: (payload: UpdateProfilePayload) => {
        return api.patch("/users/me", payload);
    },

    changePassword: (payload: ChangePasswordPayload) => {
        return api.patch("/users/me/password", payload);
    },
};

