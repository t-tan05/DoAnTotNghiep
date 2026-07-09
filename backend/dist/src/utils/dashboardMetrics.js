const pageViews = new Map();
const onlineVisitors = new Map();
const onlineStaff = new Map();
function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function getTodayBucket() {
    const key = getLocalDateKey();
    const existed = pageViews.get(key);
    if (existed)
        return existed;
    const bucket = {
        guest: 0,
        authenticated: 0,
        total: 0,
        paths: new Map(),
    };
    pageViews.set(key, bucket);
    return bucket;
}
export function trackPageView(params) {
    const bucket = getTodayBucket();
    const kind = params.userId ? "authenticated" : "guest";
    const path = params.path?.trim() || "/";
    bucket[kind] += 1;
    bucket.total += 1;
    bucket.paths.set(path, (bucket.paths.get(path) || 0) + 1);
}
export function setOnlineVisitor(socketId, visitor) {
    onlineVisitors.set(socketId, visitor);
}
export function removeOnlineVisitor(socketId) {
    onlineVisitors.delete(socketId);
}
export function setOnlineStaff(socketId, staff) {
    onlineStaff.set(socketId, staff);
}
export function removeOnlineStaff(socketId) {
    onlineStaff.delete(socketId);
}
export function getDashboardRuntimeMetrics() {
    const bucket = getTodayBucket();
    const uniqueAuthenticatedVisitors = new Set();
    for (const visitor of onlineVisitors.values()) {
        if (visitor.userId)
            uniqueAuthenticatedVisitors.add(visitor.userId);
    }
    const activeEmployeeIds = new Set();
    const activeAdminIds = new Set();
    for (const staff of onlineStaff.values()) {
        if (staff.roles.includes("EMPLOYEE"))
            activeEmployeeIds.add(staff.userId);
        if (staff.roles.includes("ADMIN"))
            activeAdminIds.add(staff.userId);
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
