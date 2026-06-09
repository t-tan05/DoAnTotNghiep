export type UpdateProfilePayload = {
    name: string;
};

export type ChangePasswordPayload = {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
};