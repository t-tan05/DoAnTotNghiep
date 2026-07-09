import prisma from "#config/prisma";
import { getDashboardRuntimeMetrics } from "#utils/dashboardMetrics";
function startOfToday() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
}
function endOfToday() {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
}
function formatMoney(value) {
    return Number(value || 0);
}
function buildRevenueBuckets(intervalMinutes) {
    const start = startOfToday();
    const end = endOfToday();
    const buckets = [];
    for (let cursor = new Date(start); cursor <= end;) {
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
export async function getDashboardSummaryService(query) {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();
    const intervalMinutes = Math.min(Math.max(Number(query?.intervalMinutes) || 60, 15), 240);
    const lowStockThreshold = Math.min(Math.max(Number(query?.lowStockThreshold) || 5, 1), 50);
    const completedTodayWhere = {
        status: "COMPLETED",
        payment_status: "PAID",
        order_date: {
            gte: todayStart,
            lte: todayEnd,
        },
    };
    const [revenueAggregate, ordersToday, completedOrdersToday, revenueOrders, bestSellerGroups, lowStockVariants,] = await prisma.$transaction([
        prisma.orders.aggregate({
            where: completedTodayWhere,
            _sum: {
                total_price: true,
            },
        }),
        prisma.orders.count({
            where: {
                order_date: {
                    gte: todayStart,
                    lte: todayEnd,
                },
            },
        }),
        prisma.orders.count({
            where: completedTodayWhere,
        }),
        prisma.orders.findMany({
            where: completedTodayWhere,
            select: {
                order_date: true,
                total_price: true,
            },
            orderBy: {
                order_date: "asc",
            },
        }),
        prisma.orders_details.groupBy({
            by: ["variant_id"],
            where: {
                orders: completedTodayWhere,
            },
            _sum: {
                quantity: true,
                price: true,
            },
            orderBy: {
                _sum: {
                    quantity: "desc",
                },
            },
            take: 5,
        }),
        prisma.product_variants.findMany({
            orderBy: {
                quantity_in_stock: "asc",
            },
            take: 30,
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
        }),
    ]);
    const bestSellerVariantIds = bestSellerGroups.map((item) => item.variant_id);
    const bestSellerVariants = bestSellerVariantIds.length
        ? await prisma.product_variants.findMany({
            where: {
                variant_id: {
                    in: bestSellerVariantIds,
                },
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
        })
        : [];
    const bestSellerMap = new Map(bestSellerVariants.map((variant) => [variant.variant_id, variant]));
    const bestSellers = bestSellerGroups.map((group) => {
        const variant = bestSellerMap.get(group.variant_id);
        const sold = Number(group._sum.quantity || 0);
        const price = formatMoney(variant?.price);
        return {
            variantId: group.variant_id,
            sku: variant?.sku || "",
            name: variant?.variant_name || variant?.products.product_name || "Sản phẩm",
            productName: variant?.products.product_name || "",
            imageUrl: variant?.image_url || variant?.product_images?.[0]?.image_url || "",
            sold,
            revenue: sold * price,
        };
    });
    const lowStock = lowStockVariants
        .map((variant) => {
        const available = Number(variant.quantity_in_stock || 0) - Number(variant.reserved_quantity || 0);
        return {
            variantId: variant.variant_id,
            sku: variant.sku || "",
            name: variant.variant_name || variant.products.product_name,
            productName: variant.products.product_name,
            imageUrl: variant.image_url || variant.product_images?.[0]?.image_url || "",
            quantityInStock: Number(variant.quantity_in_stock || 0),
            reservedQuantity: Number(variant.reserved_quantity || 0),
            available,
        };
    })
        .filter((variant) => variant.available <= lowStockThreshold)
        .sort((a, b) => a.available - b.available)
        .slice(0, 8);
    const chartBuckets = buildRevenueBuckets(intervalMinutes);
    for (const order of revenueOrders) {
        const bucket = chartBuckets.find((item) => order.order_date >= item.from && order.order_date < item.to);
        if (bucket) {
            bucket.revenue += formatMoney(order.total_price);
            bucket.orders += 1;
        }
    }
    return {
        generatedAt: new Date().toISOString(),
        intervalMinutes,
        cards: {
            todayRevenue: formatMoney(revenueAggregate._sum.total_price),
            ordersToday,
            completedOrdersToday,
            lowStockCount: lowStock.length,
        },
        revenueChart: chartBuckets.map(({ label, revenue, orders }) => ({
            label,
            revenue,
            orders,
        })),
        bestSellers,
        lowStock,
        ...getDashboardRuntimeMetrics(),
    };
}
