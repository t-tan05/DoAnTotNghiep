import prisma from "#config/prisma";
import { getDashboardRuntimeMetrics } from "#utils/dashboardMetrics";
import { orders_payment_status, orders_status } from "@prisma/client";
import type { Prisma } from "@prisma/client";

type DateFilterPreset =
    | "today"
    | "last7days"
    | "thisMonth"
    | "lastMonth"
    | "thisYear"
    | "custom";

type ChartBucketUnit = "hour" | "day" | "week" | "month";

function startOfDay(date = new Date()) {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
}

function endOfDay(date = new Date()) {
    const value = new Date(date);
    value.setHours(23, 59, 59, 999);
    return value;
}

function formatMoney(value: unknown) {
    return Number(value || 0);
}

function getRate(value: number, total: number) {
    if(!total) return 0;
    return Number(((value / total) * 100).toFixed(2));
}

function buildCompletedOrderWhere(from: Date, to: Date): Prisma.ordersWhereInput {
    return {
        status: orders_status.COMPLETED,
        payment_status: orders_payment_status.PAID,
        OR: [
            {
                completed_at: {
                    gte: from,
                    lte: to,
                },
            },
            {
                completed_at: null,
                order_date: {
                    gte: from,
                    lte: to,
                },
            },
        ],
    };
}

function buildStatusDateWhere(
    status: orders_status,
    dateField: "cancelled_at" | "delivery_failed_at",
    from: Date,
    to: Date,
): Prisma.ordersWhereInput {
    return {
        status,
        OR: [
            {
                [dateField]: {
                    gte: from,
                    lte: to,
                },
            },
            {
                [dateField]: null,
                order_date: {
                    gte: from,
                    lte: to,
                },
            },
        ],
    };
}

function getVariantImage(variant: {
    image_url?: string | null;
    product_images?: Array<{ image_url: string }>;
}) {
    return variant.image_url || variant.product_images?.[0]?.image_url || "";
}

function buildDateRange(query?: {
    preset?: DateFilterPreset;
    fromDate?: string;
    toDate?: string;
}) {
    const now = new Date();
    const preset = query?.preset || "today";

    if(preset === "custom" && query?.fromDate && query?.toDate) {
        return {
            preset,
            from: startOfDay(new Date(query.fromDate)),
            to: endOfDay(new Date(query.toDate)),
        };
    }

    if(preset === "last7days") {
        const from = startOfDay();
        from.setDate(from.getDate() - 6);
        return { preset, from, to: endOfDay() };
    }

    if(preset === "thisMonth") {
        return {
            preset,
            from: new Date(now.getFullYear(), now.getMonth(), 1),
            to: endOfDay(),
        };
    }

    if(preset === "lastMonth") {
        return {
            preset,
            from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            to: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)),
        };
    }

    if(preset === "thisYear") {
        return {
            preset,
            from: new Date(now.getFullYear(), 0, 1),
            to: endOfDay(),
        };
    }

    return {
        preset: "today" as const,
        from: startOfDay(),
        to: endOfDay(),
    };
}

function buildRevenueBuckets(intervalMinutes: number) {
    const range = buildDateRange({ preset: "today" });
    const buckets: Array<{
        label: string;
        from: Date;
        to: Date;
        revenue: number;
        orders: number;
    }> = [];

    for(let cursor = new Date(range.from); cursor <= range.to;) {
        const from = new Date(cursor);
        const to = new Date(cursor);
        to.setMinutes(to.getMinutes() + intervalMinutes);

        buckets.push({
            label: from.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
            from,
            to,
            revenue: 0,
            orders: 0,
        });

        cursor = to;
    }

    return buckets;
}

function buildStatisticsBuckets(from: Date, to: Date, preset: DateFilterPreset) {
    const diffDays = Math.max(Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)), 1);
    const unit: ChartBucketUnit = preset === "today" || diffDays <= 1
        ? "hour"
        : preset === "thisYear" || diffDays > 120
            ? "month"
            : diffDays > 45
                ? "week"
                : "day";
    const buckets: Array<{
        label: string;
        from: Date;
        to: Date;
        revenue: number;
        orders: number;
    }> = [];

    for(let cursor = new Date(from); cursor <= to;) {
        const bucketStart = new Date(cursor);
        const bucketEnd = new Date(cursor);

        if(unit === "hour") bucketEnd.setHours(bucketEnd.getHours() + 2);
        if(unit === "day") bucketEnd.setDate(bucketEnd.getDate() + 1);
        if(unit === "week") bucketEnd.setDate(bucketEnd.getDate() + 7);
        if(unit === "month") bucketEnd.setMonth(bucketEnd.getMonth() + 1);

        const label = unit === "hour"
            ? bucketStart.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false })
            : unit === "month"
                ? bucketStart.toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })
                : bucketStart.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

        buckets.push({
            label,
            from: bucketStart,
            to: bucketEnd > to ? new Date(to.getTime() + 1) : bucketEnd,
            revenue: 0,
            orders: 0,
        });

        cursor = bucketEnd;
    }

    return { buckets, unit };
}

async function getLowStockItems(lowStockThreshold: number, page: number, limit: number) {
    const variants = await prisma.product_variants.findMany({
        orderBy: {
            quantity_in_stock: "asc",
        },
        include: {
            products: {
                select: {
                    product_id: true,
                    product_name: true,
                },
            },
            product_images: {
                orderBy: {
                    is_default: "desc",
                },
                take: 1,
            },
        },
    });

    const allItems = variants
        .map((variant) => {
            const available = Number(variant.quantity_in_stock || 0) - Number(variant.reserved_quantity || 0);

            return {
                variantId: variant.variant_id,
                sku: variant.sku || "",
                name: variant.variant_name || variant.products.product_name,
                productName: variant.products.product_name,
                imageUrl: getVariantImage(variant),
                quantityInStock: Number(variant.quantity_in_stock || 0),
                reservedQuantity: Number(variant.reserved_quantity || 0),
                available,
            };
        })
        .filter((variant) => variant.available <= lowStockThreshold)
        .sort((a, b) => a.available - b.available);

    const totalItems = allItems.length;
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * limit;

    return {
        items: allItems.slice(start, start + limit),
        totalItems,
        totalPages,
        page: safePage,
        limit,
    };
}

async function getProductStats(where: Prisma.ordersWhereInput, take = 5) {
    const details = await prisma.orders_details.findMany({
        where: {
            orders: where,
        },
        select: {
            quantity: true,
            price: true,
            product_variants: {
                select: {
                    variant_id: true,
                    sku: true,
                    variant_name: true,
                    image_url: true,
                    product_images: {
                        orderBy: {
                            is_default: "desc",
                        },
                        take: 1,
                        select: {
                            image_url: true,
                        },
                    },
                    products: {
                        select: {
                            product_id: true,
                            product_name: true,
                        },
                    },
                },
            },
        },
    });

    const productMap = new Map<string, {
        productId: string;
        variantId: string;
        sku: string;
        name: string;
        productName: string;
        imageUrl: string;
        sold: number;
        revenue: number;
    }>();

    for(const detail of details) {
        const variant = detail.product_variants;
        const productId = variant.products.product_id;
        const current = productMap.get(productId);
        const quantity = Number(detail.quantity || 0);
        const revenue = quantity * formatMoney(detail.price);

        if(current) {
            current.sold += quantity;
            current.revenue += revenue;
        }else {
            productMap.set(productId, {
                productId,
                variantId: variant.variant_id,
                sku: variant.sku || "",
                name: variant.variant_name || variant.products.product_name,
                productName: variant.products.product_name,
                imageUrl: getVariantImage(variant),
                sold: quantity,
                revenue,
            });
        }
    }

    const products = Array.from(productMap.values());

    return {
        topSelling: [...products].sort((a, b) => b.sold - a.sold).slice(0, take),
        topRevenue: [...products].sort((a, b) => b.revenue - a.revenue).slice(0, take),
    };
}

export async function getDashboardSummaryAnalyticsService(query?: {
    intervalMinutes?: number;
    lowStockThreshold?: number;
    lowStockPage?: number;
    lowStockLimit?: number;
}) {
    const today = buildDateRange({ preset: "today" });
    const intervalMinutes = Math.min(Math.max(Number(query?.intervalMinutes) || 120, 120), 180);
    const lowStockThreshold = Math.min(Math.max(Number(query?.lowStockThreshold) || 4, 1), 50);
    const lowStockPage = Math.max(Number(query?.lowStockPage) || 1, 1);
    const lowStockLimit = Math.min(Math.max(Number(query?.lowStockLimit) || 6, 1), 20);
    const last7DaysStart = startOfDay();
    last7DaysStart.setDate(last7DaysStart.getDate() - 6);

    const completedTodayWhere = buildCompletedOrderWhere(today.from, today.to);

    const [
        revenueAggregate,
        ordersToday,
        completedOrdersToday,
        deliveryFailedToday,
        pendingOrders,
        cancelledOrders,
        cancelledOrdersToday,
        warrantyRequestsToday,
        newCustomersToday,
        newCustomersLast7Days,
        newCustomersThisMonth,
        revenueOrders,
        productStats,
        lowStockResult,
    ] = await Promise.all([
        prisma.orders.aggregate({
            where: completedTodayWhere,
            _sum: {
                total_price: true,
            },
        }),
        prisma.orders.count({
            where: {
                order_date: {
                    gte: today.from,
                    lte: today.to,
                },
            },
        }),
        prisma.orders.count({
            where: completedTodayWhere,
        }),
        prisma.orders.count({
            where: buildStatusDateWhere(orders_status.DELIVERY_FAILED, "delivery_failed_at", today.from, today.to),
        }),
        prisma.orders.count({
            where: {
                status: orders_status.PENDING,
            },
        }),
        prisma.orders.count({
            where: {
                status: orders_status.CANCELLED,
            },
        }),
        prisma.orders.count({
            where: buildStatusDateWhere(orders_status.CANCELLED, "cancelled_at", today.from, today.to),
        }),
        prisma.warranties.count({
            where: {
                created_at: {
                    gte: today.from,
                    lte: today.to,
                },
            },
        }),
        prisma.users.count({
            where: {
                created_at: {
                    gte: today.from,
                    lte: today.to,
                },
                users_roles: {
                    some: {
                        role_name: "CUSTOMER",
                    },
                },
            },
        }),
        prisma.users.count({
            where: {
                created_at: {
                    gte: last7DaysStart,
                    lte: today.to,
                },
                users_roles: {
                    some: {
                        role_name: "CUSTOMER",
                    },
                },
            },
        }),
        prisma.users.count({
            where: {
                created_at: {
                    gte: new Date(today.from.getFullYear(), today.from.getMonth(), 1),
                    lte: today.to,
                },
                users_roles: {
                    some: {
                        role_name: "CUSTOMER",
                    },
                },
            },
        }),
        prisma.orders.findMany({
            where: completedTodayWhere,
            select: {
                completed_at: true,
                order_date: true,
                total_price: true,
            },
            orderBy: {
                order_date: "asc",
            },
        }),
        getProductStats(completedTodayWhere, 5),
        getLowStockItems(lowStockThreshold, lowStockPage, lowStockLimit),
    ]);

    const chartBuckets = buildRevenueBuckets(intervalMinutes);

    for(const order of revenueOrders) {
        const revenueDate = order.completed_at || order.order_date;
        if(!revenueDate) continue;

        const bucket = chartBuckets.find((item) => revenueDate >= item.from && revenueDate < item.to);

        if(bucket) {
            bucket.revenue += formatMoney(order.total_price);
            bucket.orders += 1;
        }
    }

    const ratioTotal = completedOrdersToday + cancelledOrdersToday + deliveryFailedToday;

    return {
        generatedAt: new Date().toISOString(),
        intervalMinutes,
        cards: {
            todayRevenue: formatMoney(revenueAggregate._sum.total_price),
            ordersToday,
            completedOrdersToday,
            deliveryFailedToday,
            pendingOrders,
            cancelledOrders,
            cancelledOrdersToday,
            warrantyRequestsToday,
            lowStockCount: lowStockResult.totalItems,
            newCustomers: {
                today: newCustomersToday,
                last7Days: newCustomersLast7Days,
                thisMonth: newCustomersThisMonth,
            },
        },
        revenueChart: chartBuckets.map(({ label, revenue, orders }) => ({
            label,
            revenue,
            orders,
        })),
        orderRate: {
            completed: completedOrdersToday,
            cancelled: cancelledOrdersToday,
            deliveryFailed: deliveryFailedToday,
            total: ratioTotal,
            successRate: getRate(completedOrdersToday, ratioTotal),
            cancelRate: getRate(cancelledOrdersToday, ratioTotal),
            deliveryFailedRate: getRate(deliveryFailedToday, ratioTotal),
        },
        bestSellers: productStats.topSelling,
        lowStock: lowStockResult.items,
        lowStockPagination: {
            page: lowStockResult.page,
            limit: lowStockResult.limit,
            totalItems: lowStockResult.totalItems,
            totalPages: lowStockResult.totalPages,
        },
        ...getDashboardRuntimeMetrics(),
    };
}

export async function getAdminStatisticsService(query?: {
    preset?: DateFilterPreset;
    fromDate?: string;
    toDate?: string;
}) {
    const range = buildDateRange(query);
    const completedWhere = buildCompletedOrderWhere(range.from, range.to);

    const [
        revenueAggregate,
        totalOrders,
        completedOrders,
        cancelledOrders,
        deliveryFailedOrders,
        pendingOrders,
        revenueOrders,
        productStats,
        newCustomers,
        totalCustomers,
        warrantyRequests,
        topWarrantyProductsRaw,
    ] = await Promise.all([
        prisma.orders.aggregate({
            where: completedWhere,
            _sum: {
                total_price: true,
            },
        }),
        prisma.orders.count({
            where: {
                order_date: {
                    gte: range.from,
                    lte: range.to,
                },
            },
        }),
        prisma.orders.count({
            where: completedWhere,
        }),
        prisma.orders.count({
            where: buildStatusDateWhere(orders_status.CANCELLED, "cancelled_at", range.from, range.to),
        }),
        prisma.orders.count({
            where: buildStatusDateWhere(orders_status.DELIVERY_FAILED, "delivery_failed_at", range.from, range.to),
        }),
        prisma.orders.count({
            where: {
                status: orders_status.PENDING,
                order_date: {
                    gte: range.from,
                    lte: range.to,
                },
            },
        }),
        prisma.orders.findMany({
            where: completedWhere,
            select: {
                completed_at: true,
                order_date: true,
                total_price: true,
            },
            orderBy: {
                order_date: "asc",
            },
        }),
        getProductStats(completedWhere, 8),
        prisma.users.count({
            where: {
                created_at: {
                    gte: range.from,
                    lte: range.to,
                },
                users_roles: {
                    some: {
                        role_name: "CUSTOMER",
                    },
                },
            },
        }),
        prisma.users.count({
            where: {
                users_roles: {
                    some: {
                        role_name: "CUSTOMER",
                    },
                },
            },
        }),
        prisma.warranties.count({
            where: {
                created_at: {
                    gte: range.from,
                    lte: range.to,
                },
            },
        }),
        prisma.warranties.findMany({
            where: {
                created_at: {
                    gte: range.from,
                    lte: range.to,
                },
            },
            select: {
                devices: {
                    select: {
                        product_variants: {
                            select: {
                                variant_id: true,
                                variant_name: true,
                                image_url: true,
                                product_images: {
                                    orderBy: {
                                        is_default: "desc",
                                    },
                                    take: 1,
                                    select: {
                                        image_url: true,
                                    },
                                },
                                products: {
                                    select: {
                                        product_id: true,
                                        product_name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }),
    ]);

    const { buckets, unit } = buildStatisticsBuckets(range.from, range.to, range.preset);

    for(const order of revenueOrders) {
        const revenueDate = order.completed_at || order.order_date;
        if(!revenueDate) continue;

        const bucket = buckets.find((item) => revenueDate >= item.from && revenueDate < item.to);

        if(bucket) {
            bucket.revenue += formatMoney(order.total_price);
            bucket.orders += 1;
        }
    }

    const warrantyProductMap = new Map<string, {
        productId: string;
        variantId: string;
        name: string;
        productName: string;
        imageUrl: string;
        warrantyCount: number;
    }>();

    for(const warranty of topWarrantyProductsRaw) {
        const variant = warranty.devices.product_variants;
        const product = variant.products;
        const current = warrantyProductMap.get(product.product_id);

        if(current) {
            current.warrantyCount += 1;
        }else {
            warrantyProductMap.set(product.product_id, {
                productId: product.product_id,
                variantId: variant.variant_id,
                name: variant.variant_name || product.product_name,
                productName: product.product_name,
                imageUrl: getVariantImage(variant),
                warrantyCount: 1,
            });
        }
    }

    const totalRevenue = formatMoney(revenueAggregate._sum.total_price);
    const ratioTotal = completedOrders + cancelledOrders + deliveryFailedOrders;

    return {
        generatedAt: new Date().toISOString(),
        filter: {
            preset: range.preset,
            fromDate: range.from.toISOString(),
            toDate: range.to.toISOString(),
            chartUnit: unit,
        },
        summary: {
            totalRevenue,
            totalOrders,
            averageOrderValue: totalOrders ? Math.round(totalRevenue / totalOrders) : 0,
            newCustomers,
            totalCustomers,
            warrantyRequests,
        },
        revenueChart: buckets.map(({ label, revenue, orders }) => ({
            label,
            revenue,
            orders,
        })),
        orderStats: {
            totalOrders,
            completedOrders,
            cancelledOrders,
            deliveryFailedOrders,
            pendingOrders,
            successRate: getRate(completedOrders, ratioTotal),
            cancelRate: getRate(cancelledOrders, ratioTotal),
            deliveryFailedRate: getRate(deliveryFailedOrders, ratioTotal),
        },
        topSellingProducts: productStats.topSelling,
        topRevenueProducts: productStats.topRevenue,
        topWarrantyProducts: Array.from(warrantyProductMap.values())
            .sort((a, b) => b.warrantyCount - a.warrantyCount)
            .slice(0, 8),
    };
}
