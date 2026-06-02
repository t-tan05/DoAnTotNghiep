import type { CookieOptions } from "express";

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 3 * 60 * 60 * 1000,
    path: "/api/auth",
};