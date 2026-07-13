type RedirectLocation = {
    pathname?: string;
    search?: string;
    hash?: string;
};

export function getSafeRedirectPath(value: unknown) {
    let path = "";

    if(typeof value === "string") {
        path = value;
    }else if(value && typeof value === "object") {
        const location = value as RedirectLocation;
        path = `${location.pathname || ""}${location.search || ""}${location.hash || ""}`;
    }

    if(!path || !path.startsWith("/") || path.startsWith("//")) return undefined;
    if(path.startsWith("/login") || path.startsWith("/register")) return undefined;

    return path;
}
