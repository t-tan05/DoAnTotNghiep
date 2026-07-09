type VisitorKind = "guest" | "authenticated";

type PageViewBucket = {
    guest: number;
    authenticated: number;
    total: number;
    paths: Map<string, number>;
};

type OnlineVisitor = {
    kind: VisitorKind;
    userId?: string | null;
};

type OnlineStaff = {
    userId: string;
    roles: string[];
};

const pageViews = new Map<string, PageViewBucket>();
const onlineVisitors = new Map<string, OnlineVisitor>();
const onlineStaff = new Map<string, OnlineStaff>();

function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getTodayBucket() {
    const key = getLocalDateKey();
    const existed = pageViews.get(key);

    if(existed) return existed;

    const bucket: PageViewBucket = {
        guest: 0,
        authenticated: 0,
        total: 0,
        paths: new Map(),
    };

    pageViews.set(key, bucket);
    return bucket;
}

export function trackPageView(params: {
    path?: string;
    userId?: string | null;
}) {
    const bucket = getTodayBucket();
    const kind: VisitorKind = params.userId ? "authenticated" : "guest";
    const path = params.path?.trim() || "/";

    bucket[kind] += 1;
    bucket.total += 1;
    bucket.paths.set(path, (bucket.paths.get(path) || 0) + 1);
}

export function setOnlineVisitor(socketId: string, visitor: OnlineVisitor) {
    onlineVisitors.set(socketId, visitor);
}

export function removeOnlineVisitor(socketId: string) {
    onlineVisitors.delete(socketId);
}

export function setOnlineStaff(socketId: string, staff: OnlineStaff) {
    onlineStaff.set(socketId, staff);
}

export function removeOnlineStaff(socketId: string) {
    onlineStaff.delete(socketId);
}

export function getDashboardRuntimeMetrics() {
    const bucket = getTodayBucket();
    const uniqueAuthenticatedVisitors = new Set<string>();

    for(const visitor of onlineVisitors.values()) {
        if(visitor.userId) uniqueAuthenticatedVisitors.add(visitor.userId);
    }

    const activeEmployeeIds = new Set<string>();
    const activeAdminIds = new Set<string>();

    for(const staff of onlineStaff.values()) {
        if(staff.roles.includes("EMPLOYEE")) activeEmployeeIds.add(staff.userId);
        if(staff.roles.includes("ADMIN")) activeAdminIds.add(staff.userId);
    }

    return {
        traffic: {
            pageViewsToday: {
                total: bucket.total,
                guest: bucket.guest,
                authenticated: bucket.authenticated,
            },
            online: {
                total: onlineVisitors.size,
                guest: Array.from(onlineVisitors.values()).filter((item) => item.kind === "guest").length,
                authenticated: uniqueAuthenticatedVisitors.size,
            },
            topPagesToday: Array.from(bucket.paths.entries())
                .map(([path, views]) => ({ path, views }))
                .sort((a, b) => b.views - a.views)
                .slice(0, 5),
        },
        activeStaff: {
            employees: activeEmployeeIds.size,
            admins: activeAdminIds.size,
            total: new Set(Array.from(onlineStaff.values()).map((staff) => staff.userId)).size,
        },
    };
}
