import prisma from "#config/prisma";
export const findMyOrders = async (userId) => {
    return await prisma.orders.findMany({
        where: {
            user_id: userId,
        },
        include: {
            orders_details: {
                include: {
                    product_variants: {
                        include: {
                            products: true,
                            product_images: {
                                where: {
                                    is_default: true,
                                },
                                take: 1,
                            },
                            variant_attribute_values: {
                                include: {
                                    attribute_values: {
                                        include: {
                                            product_attributes: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    devices: true,
                },
            },
            addresses: true,
            payment_transactions: true,
        },
        orderBy: {
            order_date: "desc",
        },
    });
};
export const findOrderDetailForUser = async (orderId, userId) => {
    return await prisma.orders.findFirst({
        where: {
            order_id: orderId,
            user_id: userId,
        },
        include: {
            addresses: true,
            payment_transactions: true,
            orders_details: {
                include: {
                    devices: true,
                    product_variants: {
                        include: {
                            products: true,
                            product_images: {
                                orderBy: {
                                    is_default: "desc",
                                },
                            },
                            variant_attribute_values: {
                                include: {
                                    attribute_values: {
                                        include: {
                                            product_attributes: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};
export const getOrderWithQuery = async (params) => {
    const { page, limit, search, status, paymentStatus, paymentMethod, fromDate, toDate, sortBy, sortOrder, } = params;
    const skip = (page - 1) * limit;
    const where = {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { payment_status: paymentStatus } : {}),
        ...(paymentMethod ? { payment_method: paymentMethod } : {}),
        ...(fromDate || toDate
            ? {
                order_date: {
                    ...(fromDate ? { gte: new Date(fromDate) } : {}),
                    ...(toDate ? { lte: new Date(toDate) } : {}),
                },
            }
            : {}),
        ...(search
            ? {
                OR: [
                    {
                        order_id: {
                            contains: search,
                        },
                    },
                    {
                        receiver_name: {
                            contains: search,
                        },
                    },
                    {
                        receiver_phone: {
                            contains: search,
                        },
                    },
                    {
                        users_orders_user_idTousers: {
                            email: {
                                contains: search,
                            },
                        },
                    },
                    {
                        users_orders_user_idTousers: {
                            name: {
                                contains: search,
                            },
                        },
                    },
                    {
                        users_orders_employee_idTousers: {
                            name: {
                                contains: search,
                            },
                        },
                    },
                ],
            } : {}),
    };
    const [orders, totalItems] = await prisma.$transaction([
        prisma.orders.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                users_orders_user_idTousers: {
                    select: {
                        user_id: true,
                        name: true,
                        email: true,
                    },
                },
                users_orders_employee_idTousers: {
                    select: {
                        user_id: true,
                        name: true,
                        email: true,
                    },
                },
                addresses: true,
                orders_details: true,
                payment_transactions: {
                    orderBy: {
                        created_at: "desc",
                    },
                    take: 1
                },
            },
        }),
        prisma.orders.count({ where }),
    ]);
    return {
        orders,
        totalItems,
    };
};
export const findOrderDetailForStaff = async (orderId) => {
    return await prisma.orders.findUnique({
        where: {
            order_id: orderId,
        },
        include: {
            users_orders_user_idTousers: {
                select: {
                    user_id: true,
                    name: true,
                    email: true,
                },
            },
            users_orders_employee_idTousers: {
                select: {
                    user_id: true,
                    name: true,
                    email: true,
                },
            },
            addresses: true,
            payment_transactions: {
                orderBy: {
                    created_at: "desc",
                },
            },
            orders_details: {
                include: {
                    devices: true,
                    product_variants: {
                        include: {
                            products: true,
                            product_images: {
                                orderBy: {
                                    is_default: "desc",
                                },
                            },
                            variant_attribute_values: {
                                include: {
                                    attribute_values: {
                                        include: {
                                            product_attributes: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};
export const findOrderById = async (orderId) => {
    return await prisma.orders.findUnique({
        where: {
            order_id: orderId,
        },
    });
};
export const update = async (orderId, data) => {
    return await prisma.orders.update({
        where: {
            order_id: orderId,
        },
        data,
    });
};
