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
