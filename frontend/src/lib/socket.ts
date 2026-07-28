import { io } from "socket.io-client";

const getSocketUrl = () => {
    const envApiUrl = import.meta.env.VITE_API_URL;
    const isLocalEnvApi =
        envApiUrl?.includes("://localhost") || envApiUrl?.includes("://127.0.0.1");
    const isLanAccess =
        window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";

    if(envApiUrl && !(isLanAccess && isLocalEnvApi)){
        return envApiUrl.replace(/\/api\/?$/, "");
    }

    return `${window.location.protocol}//${window.location.hostname}:3000`;
};

export const socket = io(getSocketUrl(), {
    withCredentials: true,
    autoConnect: false,
});
