export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export type VerifyEmailPayload = {
    email: string;
    verifyToken: string;
};

export type ForgotPasswordPayload = {
    email: string;
};

export type VerifyResetCodePayload = {
    email: string;
    resetCode: string;
};

export type ResetPasswordPayload = {
    email: string;
    resetCode: string;
    newPassword: string;
    confirmPassword: string;
};

export type AuthUser = {
    user_id: string;
    name: string;
    email: string;
    verified: boolean;
    status: string;
    must_change_password?: boolean;
    roles?: Array<string>;
};
