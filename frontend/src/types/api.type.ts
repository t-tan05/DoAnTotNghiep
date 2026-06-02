import type { InternalAxiosRequestConfig } from "axios";

export type BackendError = {
    status?: "fail" | "error";
    message?: string;
    errors?: Array<{
        field?: string;
        message: string;
    }>;
};

export type BackendSuccess<T = unknown> = {
    success?: boolean;
    message: string;
    data?: T;
};

//Tạo type mới kế thừa các thuộc tính của request và thêm thuộc tính retry
export type RetryConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
}