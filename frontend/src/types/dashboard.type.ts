export type DashboardProductStat = {
    productId?: string;
    variantId: string;
    sku: string;
    name: string;
    productName: string;
    imageUrl: string;
    sold: number;
    revenue: number;
};

export type DashboardLowStockItem = {
    variantId: string;
    sku: string;
    name: string;
    productName: string;
    imageUrl: string;
    quantityInStock: number;
    reservedQuantity: number;
    available: number;
};

export type DashboardSummary = {
    generatedAt: string;
    intervalMinutes: number;
    cards: {
        todayRevenue: number;
        ordersToday: number;
        completedOrdersToday: number;
        deliveryFailedToday: number;
        pendingOrders: number;
        cancelledOrders: number;
        cancelledOrdersToday: number;
        warrantyRequestsToday: number;
        lowStockCount: number;
        newCustomers: {
            today: number;
            last7Days: number;
            thisMonth: number;
        };
    };
    revenueChart: Array<{
        label: string;
        revenue: number;
        orders: number;
    }>;
    orderRate: {
        completed: number;
        cancelled: number;
        deliveryFailed: number;
        total: number;
        successRate: number;
        cancelRate: number;
        deliveryFailedRate: number;
    };
    bestSellers: DashboardProductStat[];
    lowStock: DashboardLowStockItem[];
    lowStockPagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
    traffic: {
        pageViewsToday: {
            total: number;
            guest: number;
            authenticated: number;
        };
        online: {
            total: number;
            guest: number;
            authenticated: number;
        };
        topPagesToday: Array<{
            path: string;
            views: number;
        }>;
    };
    activeStaff: {
        employees: number;
        admins: number;
        total: number;
    };
};

export type StatisticsFilterPreset =
    | "today"
    | "last7days"
    | "thisMonth"
    | "lastMonth"
    | "thisYear"
    | "custom";

export type AdminStatistics = {
    generatedAt: string;
    filter: {
        preset: StatisticsFilterPreset;
        fromDate: string;
        toDate: string;
        chartUnit: "hour" | "day" | "week" | "month";
    };
    summary: {
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
        newCustomers: number;
        totalCustomers: number;
        warrantyRequests: number;
    };
    revenueChart: Array<{
        label: string;
        revenue: number;
        orders: number;
    }>;
    orderStats: {
        totalOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        deliveryFailedOrders: number;
        pendingOrders: number;
        successRate: number;
        cancelRate: number;
        deliveryFailedRate: number;
    };
    topSellingProducts: DashboardProductStat[];
    topRevenueProducts: DashboardProductStat[];
    topWarrantyProducts: Array<{
        productId: string;
        variantId: string;
        name: string;
        productName: string;
        imageUrl: string;
        warrantyCount: number;
    }>;
};
