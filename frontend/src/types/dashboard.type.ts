export type DashboardProductStat = {
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
        lowStockCount: number;
    };
    revenueChart: Array<{
        label: string;
        revenue: number;
        orders: number;
    }>;
    bestSellers: DashboardProductStat[];
    lowStock: DashboardLowStockItem[];
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
