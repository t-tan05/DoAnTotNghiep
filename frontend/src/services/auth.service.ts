import type { 
    ForgotPasswordPayload, 
    LoginPayload, 
    RegisterPayload, 
    ResetPasswordPayload, 
    VerifyEmailPayload, 
    VerifyResetCodePayload 
} from "../types/auth.type";
import { api } from "./api";

export const authService = {
    login: (payload: LoginPayload) => {
        return api.post("/auth/login", payload);
    },

    register: (payload: RegisterPayload) => {
        return api.post("/auth/register", payload);
    },

    verifyEmail: (payload: VerifyEmailPayload) => {
        return api.post("/auth/verify-email", payload);
    },

    resendVerifyEmail: (email: string) => {
        return api.post("/auth/resend-verify-email", {email});
    },

    forgotPassword: (payload: ForgotPasswordPayload) => {
        return api.post("/auth/forgot-password", payload);
    },

    verifyResetCode: (payload: VerifyResetCodePayload) => {
        return api.post("/auth/verify-reset-code", payload);
    },

    resetPassword: (payload: ResetPasswordPayload) => {
        return api.patch("/auth/reset-password", payload);
    },

    logout: () => {
        return api.post("/auth/logout");
    },

    me: () => {
        return api.get("/users/me");
    },
};