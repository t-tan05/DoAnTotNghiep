import type { AuthUser } from "@/types/auth.type";

export function isStaffUser(user?: AuthUser | null) {
    return Boolean(user?.roles?.some((role) => role === "ADMIN" || role === "EMPLOYEE"));
}

export function canUseCustomerFeatures(user?: AuthUser | null) {
    return !isStaffUser(user);
}
