import prisma from "#config/prisma";
export const findReviewByOrderIdAndProductId = async (orderId, productId) => {
    return await prisma.reviews.findUnique({
        where: {
            order_id_product_id: {
                order_id: orderId,
                product_id: productId,
            },
        },
    });
};
export const create = async (data) => {
    return await prisma.reviews.create({
        data,
        include: {
            users: {
                select: {
                    user_id: true,
                    name: true,
                },
            },
        },
    });
};
export const getProductReviewByProductId = async (productId, page, limit, rating) => {
    const skip = (page - 1) * limit;
    const reviewWhere = {
        product_id: productId,
        ...(rating ? { rating } : {}),
    };
    const summaryWhere = {
        product_id: productId,
    };
    return await prisma.$transaction([
        prisma.reviews.findMany({
            where: reviewWhere,
            skip,
            take: limit,
            orderBy: {
                created_at: "desc",
            },
            include: {
                users: {
                    select: {
                        user_id: true,
                        name: true,
                    },
                },
                //thêm review_image
            },
        }),
        prisma.reviews.aggregate({
            where: summaryWhere,
            _avg: {
                rating: true,
            },
            _count: {
                review_id: true,
            },
        }),
        prisma.reviews.groupBy({
            by: ["rating"],
            where: summaryWhere,
            _count: {
                rating: true,
            },
        }),
        prisma.reviews.count({
            where: reviewWhere,
        }),
    ]);
};
export const getAdminReviewsWithQuery = async (params) => {
    const skip = (params.page - 1) * params.limit;
    const where = {
        ...(params.rating ? { rating: params.rating } : {}),
        ...(params.productId ? { product_id: params.productId } : {}),
        ...(params.userId ? { user_id: params.userId } : {}),
        ...(params.fromDate || params.toDate ? {
            created_at: {
                ...(params.fromDate ? { gte: params.fromDate } : {}),
                ...(params.toDate ? { lte: params.toDate } : {}),
            },
        } : {}),
        ...(params.search ? {
            OR: [
                { comment: { contains: params.search } },
                { order_id: { contains: params.search } },
                { products: { product_name: { contains: params.search } } },
                { users: { name: { contains: params.search } } },
                { users: { email: { contains: params.search } } },
            ],
        } : {}),
    };
    const orderBy = params.sortBy === "product_name"
        ? { products: { product_name: params.sortOrder } }
        : params.sortBy === "customer_name"
            ? { users: { name: params.sortOrder } }
            : { [params.sortBy]: params.sortOrder };
    const [reviews, totalItems] = await prisma.$transaction([
        prisma.reviews.findMany({
            where,
            skip,
            take: params.limit,
            orderBy,
            include: {
                users: {
                    select: {
                        user_id: true,
                        name: true,
                        email: true,
                    },
                },
                products: {
                    select: {
                        product_id: true,
                        product_name: true,
                    },
                },
                orders: {
                    select: {
                        order_id: true,
                        order_date: true,
                        status: true,
                    },
                },
            },
        }),
        prisma.reviews.count({ where }),
    ]);
    return { reviews, totalItems };
};
