import axios, {
    AxiosError,
    type AxiosRequestConfig,
} from "axios";

import type { BackendError, BackendSuccess, RetryConfig } from "../types/api.type.ts";

const API_URL = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:3000/api`;

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type":"application/json",
    },
    timeout: 10000 //10 giây
});

//Lưu các api cần bỏ qua việc refreshToken
const authSkipUrls = [
    "/auth/login",
    "/auth/register",
    "/auth/verify-email",
    "/auth/resend-verify-email",
    "/auth/forgot-password",
    "/auth/verify-reset-code",
    "/auth/reset-password",
    "/auth/refresh-token",
];

//Tạo hàm kiểm tra có nên skip refreshToken không
function shouldSkipRefresh(url?: string){
    if(!url) return false;

    return authSkipUrls.some((skipUrl) => url.includes(skipUrl));
}

//Tạo hàm xử lý lỗi từ backend trả về
function getBackendErrorMessage(error: AxiosError<BackendError>){
    const data = error.response?.data;

    if(data?.errors?.length){
        return data.errors.map((item) => item.message).join("\n");
    }

    if(data?.message){
        return data.message;
    }

    if(error.code === "ECONNABORTED"){
        return "Yều cầu quá thời gian xử lý. Vui lòng thử lại.";
    }

    if(!error.response){
        return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend.";
    }

    return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

//Tạo hàm xóa accessToken khỏi localStorage
function clearAuth(){
    localStorage.removeItem("accessToken");
}

//Tạo hàm lưu accessToken vào localStorage
function saveAccessToken(accessToken: string){
    localStorage.setItem("accessToken", accessToken);
}

//Tạo hàm lấy accessToken
function getAccessToken(){
    return localStorage.getItem("accessToken");
}

api.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

let refreshPromise: Promise<string> | null = null;

//Tạo hàm async refreshToken
async function refreshAccessToken(){
    if(!refreshPromise){
        refreshPromise = api
        .post<BackendSuccess<{accessToken: string}>>("/auth/refresh-token")
        .then((res) => {
            const newAccessToken = res.data.data?.accessToken;

            if(!newAccessToken) throw new Error("Backend không trả accessToken mới.");

            saveAccessToken(newAccessToken);
            return newAccessToken;
        })
        .finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<BackendError>) => {
        const originalRequest = error.config as RetryConfig | undefined;

        if(!originalRequest) return Promise.reject(error);

        const status = error.response?.status;
        const isUnauthorized = status === 401;
        const skipRefresh = shouldSkipRefresh(originalRequest.url);

        if(isUnauthorized && !originalRequest._retry && !skipRefresh){
            originalRequest._retry = true;

            try{
                const newAccessToken = await refreshAccessToken();

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest as AxiosRequestConfig);
            }catch(refreshError){
                clearAuth();

                return Promise.reject(refreshError);
            }
        }

        const message = getBackendErrorMessage(error);

        return Promise.reject({
            ...error,
            message,
            backendMessage: message,
            backendErrors: error.response?.data?.errors ?? [],
            statusCode: status,
        });
    }
);
