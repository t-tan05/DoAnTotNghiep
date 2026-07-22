import prisma from "#config/prisma";
import crypto from "crypto";
const warrantyInclude = {
    devices: {
        include: {
            product_variants: {
                include: {
                    products: {
                        include: {
                            brands: true,
                            categories: true,
                        },
                    },
                    product_images: {
                        orderBy: {
                            is_default: "desc",
                        },
                    },
                },
            },
        },
    },
    users: {
        select: {
            user_id: true,
            name: true,
            email: true,
            addresses: {
                where: {
                    is_default: true,
                },
                take: 1,
                select: {
                    receiver_name: true,
                    phone_number: true,
                    province: true,
                    ward: true,
                    street: true,
                },
            },
        },
    },
    warranty_attachments: {
        orderBy: {
            created_at: "asc",
        },
        include: {
            users_warranty_attachments_uploaded_by_user_idTousers: {
                select: {
                    user_id: true,
                    name: true,
                    email: true,
                },
            },
            users_warranty_attachments_uploaded_by_employee_idTousers: {
                select: {
                    user_id: true,
                    name: true,
                    email: true,
                },
            },
        },
    },
    users_warranties_assigned_employee_idTousers: {
        select: {
            user_id: true,
            name: true,
            email: true,
        },
    },
    users_warranties_created_by_employee_idTousers: {
        select: {
            user_id: true,
            name: true,
            email: true,
        },
    },
    warranty_processes: {
        orderBy: {
            created_at: "asc",
        },
        include: {
            users: {
                select: {
                    user_id: true,
                    name: true,
                    email: true,
                },
            },
        },
    },
};
export const findDeviceBySerialForWarranty = async (serialNumber) => {
    return prisma.devices.findUnique({
        where: {
            serial_number: serialNumber,
        },
        include: {
            product_variants: {
                include: {
                    products: {
                        include: {
                            brands: true,
                            categories: true,
                        },
                    },
                    product_images: {
                        orderBy: {
                            is_default: "desc",
                        },
                    },
                },
            },
            orders_details: {
                include: {
                    orders: true,
                },
            },
        },
    });
};
export const findDeviceByIdForWarranty = async (deviceId) => {
    return prisma.devices.findUnique({
        where: {
            device_id: deviceId,
        },
        include: {
            product_variants: {
                include: {
                    products: {
                        include: {
                            brands: true,
                            categories: true,
                        },
                    },
                    product_images: {
                        orderBy: {
                            is_default: "desc",
                        },
                    },
                },
            },
            orders_details: {
                include: {
                    orders: true,
                },
            },
        },
    });
};
export const findWarrantyOrderDetailsByPhone = async (customerId, phoneNumber) => {
    return prisma.orders_details.findMany({
        where: {
            orders: {
                user_id: customerId,
                receiver_phone: {
                    contains: phoneNumber,
                },
                status: "COMPLETED",
            },
        },
        include: {
            orders: true,
            product_variants: {
                include: {
                    products: {
                        include: {
                            brands: true,
                            categories: true,
                        },
                    },
                    product_images: {
                        orderBy: {
                            is_default: "desc",
                        },
                    },
                },
            },
            devices: {
                include: {
                    warranties: {
                        where: {
                            status: {
                                in: [
                                    "REQUESTED",
                                    "APPROVED",
                                    "CUSTOMER_DROP_OFF",
                                    "PICKUP_SCHEDULED",
                                    "PICKED_UP",
                                    "RECEIVED",
                                    "INSPECTING",
                                    "WAITING_CUSTOMER_CONFIRMATION",
                                    "IN_PROGRESS",
                                    "SENT_TO_BRAND",
                                    "BRAND_RETURNED",
                                    "COMPLETED",
                                    "RETURN_SCHEDULED",
                                ],
                            },
                        },
                        select: {
                            warranty_id: true,
                            warranty_code: true,
                            status: true,
                        },
                        take: 1,
                    },
                },
            },
        },
        orderBy: {
            orders: {
                order_date: "desc",
            },
        },
    });
};
export const findOpenWarrantyByDeviceId = async (deviceId) => {
    return prisma.warranties.findFirst({
        where: {
            device_id: deviceId,
            status: {
                in: [
                    "REQUESTED",
                    "APPROVED",
                    "CUSTOMER_DROP_OFF",
                    "PICKUP_SCHEDULED",
                    "PICKED_UP",
                    "RECEIVED",
                    "INSPECTING",
                    "WAITING_CUSTOMER_CONFIRMATION",
                    "IN_PROGRESS",
                    "SENT_TO_BRAND",
                    "BRAND_RETURNED",
                    "COMPLETED",
                    "RETURN_SCHEDULED",
                ],
            },
        },
    });
};
export const createWarrantyWithProcess = async (data) => {
    return prisma.$transaction(async (tx) => {
        const warranty = await tx.warranties.create({
            data: data.warranty,
        });
        await tx.warranty_processes.create({
            data: data.process,
        });
        return tx.warranties.findUnique({
            where: {
                warranty_id: warranty.warranty_id,
            },
            include: warrantyInclude,
        });
    });
};
export const findWarrantyById = async (warrantyId) => {
    return prisma.warranties.findUnique({
        where: {
            warranty_id: warrantyId,
        },
        include: warrantyInclude,
    });
};
export const findMyWarrantyById = async (warrantyId, customerId) => {
    return prisma.warranties.findFirst({
        where: {
            warranty_id: warrantyId,
            customer_id: customerId,
        },
        include: warrantyInclude,
    });
};
export const getWarrantiesWithQuery = async (params) => {
    const { page, limit, search, status, employeeId, requestChannel, serviceMethod, fromDate, toDate, sortBy = "created_at", sortOrder = "desc", } = params;
    const skip = (page - 1) * limit;
    const where = {
        ...(status ? { status } : {}),
        ...(requestChannel ? { request_channel: requestChannel } : {}),
        ...(serviceMethod ? { service_method: serviceMethod } : {}),
        ...(employeeId ? { assigned_employee_id: employeeId } : {}),
        ...(fromDate || toDate
            ? {
                received_date: {
                    ...(fromDate ? { gte: new Date(fromDate) } : {}),
                    ...(toDate ? { lte: new Date(toDate) } : {}),
                },
            }
            : {}),
        ...(search
            ? {
                OR: [
                    { warranty_id: { contains: search } },
                    { warranty_code: { contains: search } },
                    { devices: { serial_number: { contains: search } } },
                    { users: { name: { contains: search } } },
                    { users: { email: { contains: search } } },
                    {
                        users: {
                            addresses: {
                                some: {
                                    OR: [
                                        { receiver_name: { contains: search } },
                                        { phone_number: { contains: search } },
                                    ],
                                },
                            },
                        },
                    },
                ],
            }
            : {}),
    };
    const [warranties, totalItems] = await prisma.$transaction([
        prisma.warranties.findMany({
            where,
            skip,
            take: limit,
            include: warrantyInclude,
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.warranties.count({ where }),
    ]);
    return {
        warranties,
        totalItems,
    };
};
export const getMyWarranties = async (customerId, page, limit) => {
    const skip = (page - 1) * limit;
    const [warranties, totalItems] = await prisma.$transaction([
        prisma.warranties.findMany({
            where: {
                customer_id: customerId,
            },
            skip,
            take: limit,
            include: warrantyInclude,
            orderBy: {
                created_at: "desc",
            },
        }),
        prisma.warranties.count({
            where: {
                customer_id: customerId,
            },
        }),
    ]);
    return {
        warranties,
        totalItems,
    };
};
export const updateWarrantyStatusWithProcess = async (params) => {
    return prisma.$transaction(async (tx) => {
        const currentWarranty = await tx.warranties.findUnique({
            where: {
                warranty_id: params.warrantyId,
            },
            select: {
                status: true,
            },
        });
        const warranty = await tx.warranties.update({
            where: {
                warranty_id: params.warrantyId,
            },
            data: {
                ...params.data,
                status: params.status,
                assigned_employee_id: params.employeeId,
                updated_at: new Date(),
            },
        });
        if (params.deviceStatus) {
            await tx.devices.update({
                where: {
                    device_id: warranty.device_id,
                },
                data: {
                    status: params.deviceStatus,
                },
            });
        }
        await tx.warranty_processes.create({
            data: {
                process_id: crypto.randomUUID(),
                warranty_id: params.warrantyId,
                employee_id: params.employeeId,
                action: params.action,
                old_status: currentWarranty?.status || null,
                new_status: params.status,
                note: params.note,
            },
        });
        return tx.warranties.findUnique({
            where: {
                warranty_id: params.warrantyId,
            },
            include: warrantyInclude,
        });
    });
};
