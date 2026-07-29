import { createWarrantyWithProcess, findDeviceBySerialForWarranty, findMyWarrantyById, findOpenWarrantyByDeviceId, findWarrantyById, getMyWarranties, getWarrantiesWithQuery, updateWarrantyStatusWithProcess } from "#models/warranty.model";
import { findDeviceByIdForWarranty, findWarrantyOrderDetailsByPhone, } from "#models/warranty.model";
import AppError from "#utils/AppError";
import { devices_status, warranties_status, warranty_service_method } from "@prisma/client";
import crypto from "crypto";
function isWarrantyValid(warrantyEndDate) {
    if (!warrantyEndDate)
        return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(warrantyEndDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
}
;
function generateWarrantyCode() {
    const now = new Date();
    const datePart = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
    ].join("");
    const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `BH${datePart}${randomPart}`;
}
;
function assertWarrantyStatus(currentStatus, allowedStatuses, message) {
    if (!allowedStatuses.includes(currentStatus)) {
        throw new AppError(message, 400);
    }
}
;
function parseOptionalDate(value) {
    return value ? new Date(value) : undefined;
}
;
export const lookupWarrantyBySerialService = async (serialNumber) => {
    const device = await findDeviceBySerialForWarranty(serialNumber.trim());
    if (!device) {
        return {
            isValid: false,
            message: "Không tìm thấy số seri của thiết bị này.",
        };
    }
    if (device.status !== devices_status.SOLD) {
        return {
            isValid: false,
            message: "Sản phẩm chưa được ghi nhận là đã bán hoặc không đủ điều kiện bảo hành.",
        };
    }
    if (!isWarrantyValid(device.warranty_end_date)) {
        return {
            isValid: false,
            message: "Sản phẩm đã hết hạn bảo hành.",
            serialNumber: device.serial_number,
            warrantyEndDate: device.warranty_end_date,
        };
    }
    return {
        isValid: true,
        message: "Sản phẩm còn hiệu lực bảo hành.",
        deviceId: device.device_id,
        serialNumber: device.serial_number,
        soldDate: device.sold_date,
        warrantyEndDate: device.warranty_end_date,
        product: device.product_variants.products,
        variant: device.product_variants,
    };
};
export const lookupWarrantyByPhoneService = async (customerId, phoneNumber) => {
    const keyword = phoneNumber.trim();
    if (!keyword) {
        throw new AppError("Vui lòng nhập số điện thoại cần tra cứu.", 400);
    }
    const orderDetails = await findWarrantyOrderDetailsByPhone(customerId, keyword);
    const items = [];
    orderDetails.forEach((orderDetail) => {
        if (!orderDetail.devices.length) {
            items.push({
                orderId: orderDetail.order_id,
                orderDetailId: orderDetail.order_detail_id,
                deviceId: null,
                serialNumber: null,
                soldDate: orderDetail.orders.order_date,
                warrantyEndDate: null,
                isValid: false,
                hasOpenWarranty: false,
                message: "Sản phẩm này chưa có serial/thiết bị trong hệ thống. Vui lòng liên hệ cửa hàng để nhân viên tiếp nhận bảo hành thủ công.",
                product: orderDetail.product_variants.products,
                variant: orderDetail.product_variants,
            });
            return;
        }
        orderDetail.devices.forEach((device) => {
            const hasOpenWarranty = device.warranties.length > 0;
            const validWarranty = isWarrantyValid(device.warranty_end_date);
            const canCreateWarranty = device.status === devices_status.SOLD && validWarranty && !hasOpenWarranty;
            items.push({
                orderId: orderDetail.order_id,
                orderDetailId: orderDetail.order_detail_id,
                deviceId: device.device_id,
                serialNumber: device.serial_number,
                soldDate: device.sold_date || orderDetail.orders.order_date,
                warrantyEndDate: device.warranty_end_date,
                isValid: canCreateWarranty,
                hasOpenWarranty,
                message: hasOpenWarranty
                    ? "Sản phẩm này đang có phiếu bảo hành chưa hoàn tất."
                    : device.status !== devices_status.SOLD
                        ? "Sản phẩm đang ở trạng thái không thể tạo phiếu bảo hành mới."
                        : validWarranty
                            ? "Sản phẩm còn hiệu lực bảo hành."
                            : "Sản phẩm đã hết hạn bảo hành.",
                product: orderDetail.product_variants.products,
                variant: orderDetail.product_variants,
            });
        });
    });
    return {
        isValid: items.some((item) => item.isValid),
        message: items.length
            ? "Tra cứu sản phẩm theo số điện thoại thành công."
            : "Không tìm thấy sản phẩm đã mua bằng số điện thoại này.",
        phoneNumber: keyword,
        items,
    };
};
export const createWarrantyService = async (customerId, data) => {
    const device = data.deviceId
        ? await findDeviceByIdForWarranty(data.deviceId.trim())
        : await findDeviceBySerialForWarranty((data.serialNumber || "").trim());
    if (!device)
        throw new AppError("Không tìm thấy sản phẩm trong hệ thống.", 404);
    if (device.orders_details?.orders?.user_id && device.orders_details.orders.user_id !== customerId) {
        throw new AppError("Bạn không có quyền tạo bảo hành cho sản phẩm này.", 403);
    }
    if (device.status !== devices_status.SOLD) {
        throw new AppError("Sản phẩm không đủ điều kiện tạo bảo hành.", 400);
    }
    if (!isWarrantyValid(device.warranty_end_date)) {
        throw new AppError("Sản phẩm đã hết hạn bảo hành.", 400);
    }
    const openWarranty = await findOpenWarrantyByDeviceId(device.device_id);
    if (openWarranty) {
        throw new AppError("Sản phẩm này đang có phiếu bảo hành chưa hoàn tất.", 400);
    }
    const warrantyId = crypto.randomUUID();
    const warranty = await createWarrantyWithProcess({
        warranty: {
            warranty_id: warrantyId,
            warranty_code: generateWarrantyCode(),
            device_id: device.device_id,
            customer_id: customerId,
            order_id: device.orders_details?.order_id || null,
            service_method: data.serviceMethod || warranty_service_method.PICKUP,
            pickup_receiver_name: data.pickupReceiverName || null,
            pickup_phone: data.pickupPhone || null,
            pickup_address: data.pickupAddress || null,
            issue_description: data.issueDescription,
            note: data.note || null,
            status: warranties_status.REQUESTED,
        },
        process: {
            process_id: crypto.randomUUID(),
            warranty_id: warrantyId,
            employee_id: null,
            action: "CUSTOMER_REQUEST",
            old_status: null,
            new_status: warranties_status.REQUESTED,
            note: data.note || data.issueDescription,
        },
    });
    return { warranty };
};
export const getAllWarrantiesService = async (params) => {
    const safePage = Math.max(Number(params.page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(params.limit) || 10, 1), 50);
    const { warranties, totalItems } = await getWarrantiesWithQuery({
        ...params,
        page: safePage,
        limit: safeLimit,
        search: params.search?.trim() || undefined,
        requestChannel: params.requestChannel,
        serviceMethod: params.serviceMethod,
        sortBy: params.sortBy || "created_at",
        sortOrder: params.sortOrder || "desc",
    });
    return {
        warranties,
        meta: {
            pagination: {
                page: safePage,
                limit: safeLimit,
                totalItems,
                totalPages: Math.max(Math.ceil(totalItems / safeLimit), 1),
            },
        },
    };
};
export const getWarrantyDetailService = async (warrantyId) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty) {
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    }
    return { warranty };
};
export const getMyWarrantiesService = async (customerId, page = 1, limit = 10) => {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const { warranties, totalItems } = await getMyWarranties(customerId, safePage, safeLimit);
    return {
        warranties,
        meta: {
            pagination: {
                page: safePage,
                limit: safeLimit,
                totalItems,
                totalPages: Math.max(Math.ceil(totalItems / safeLimit), 1),
            },
        },
    };
};
export const getMyWarrantyDetailService = async (warrantyId, customerId) => {
    const warranty = await findMyWarrantyById(warrantyId, customerId);
    if (!warranty) {
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    }
    return { warranty };
};
export const approveWarrantyService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [warranties_status.REQUESTED], "Chỉ có thể duyệt yêu cầu bảo hành đang chờ tiếp nhận.");
    const updatedWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: warranties_status.APPROVED,
        action: "EMPLOYEE_APPROVED",
        note: data.note,
        data: { assigned_employee_id: employeeId },
    });
    return { warranty: updatedWarranty };
};
export const rejectWarrantyService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [warranties_status.REQUESTED, warranties_status.APPROVED], "Chỉ có thể từ chối yêu cầu bảo hành chưa tiếp nhận máy.");
    const updatedWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: warranties_status.REJECTED,
        action: "EMPLOYEE_REJECTED",
        note: data.note,
        deviceStatus: devices_status.SOLD,
    });
    return { warranty: updatedWarranty };
};
export const markCustomerDropOffWarrantyService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [warranties_status.REQUESTED, warranties_status.APPROVED], "Chỉ có thể chọn mang máy tới cửa hàng khi yêu cầu chưa được tiếp nhận máy.");
    const updatedWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: warranties_status.CUSTOMER_DROP_OFF,
        action: "CUSTOMER_DROP_OFF_SELECTED",
        note: data.note,
        data: {
            assigned_employee_id: employeeId,
            service_method: warranty_service_method.DROP_OFF,
        },
    });
    return { warranty: updatedWarranty };
};
export const schedulePickupWarrantyService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [warranties_status.REQUESTED, warranties_status.APPROVED], "Chỉ có thể hẹn lấy máy khi yêu cầu chưa được lấy hoặc tiếp nhận.");
    const updatedWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: warranties_status.PICKUP_SCHEDULED,
        action: "PICKUP_SCHEDULED",
        note: data.note,
        data: {
            assigned_employee_id: employeeId,
            service_method: warranty_service_method.PICKUP,
            pickup_receiver_name: data.pickupReceiverName,
            pickup_phone: data.pickupPhone,
            pickup_address: data.pickupAddress,
            pickup_scheduled_at: new Date(data.pickupScheduledAt),
        },
    });
    return { warranty: updatedWarranty };
};
export const markPickedUpWarrantyService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [warranties_status.PICKUP_SCHEDULED], "Chỉ có thể xác nhận đã lấy máy với phiếu đã hẹn lấy máy.");
    const updatedWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: warranties_status.PICKED_UP,
        action: "PICKED_UP",
        note: data.note,
        data: { picked_up_at: new Date() },
    });
    return { warranty: updatedWarranty };
};
export const receiveWarrantyService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [warranties_status.APPROVED, warranties_status.CUSTOMER_DROP_OFF, warranties_status.PICKED_UP], "Chỉ có thể tiếp nhận máy khi yêu cầu đã được duyệt, khách mang tới cửa hàng hoặc shipper đã lấy máy.");
    const updatedWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: warranties_status.RECEIVED,
        action: "RECEIVED_AT_STORE",
        note: data.note,
        data: { received_date: new Date() },
        deviceStatus: devices_status.REPAIRING,
    });
    return { warranty: updatedWarranty };
};
export const addWarrantyProcessService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [
        warranties_status.RECEIVED,
        warranties_status.INSPECTING,
        warranties_status.WAITING_CUSTOMER_CONFIRMATION,
        warranties_status.IN_PROGRESS,
        warranties_status.SENT_TO_BRAND,
        warranties_status.BRAND_RETURNED,
        warranties_status.COMPLETED,
        warranties_status.RETURN_SCHEDULED,
    ], "Chỉ có thể ghi chú khi phiếu đã được tiếp nhận và chưa kết thúc.");
    const updatedWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: warranty.status,
        action: data.action || "PROCESS_NOTE",
        note: data.note,
        data: {
            expected_return_date: parseOptionalDate(data.expectedReturnDate),
            repair_actions: data.repairActions ?? undefined,
            accessory_changed: data.accessoryChanged ?? undefined,
        },
    });
    return { warranty: updatedWarranty };
};
export const inspectWarrantyService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [warranties_status.RECEIVED, warranties_status.INSPECTING], "Chỉ có thể kiểm tra kỹ thuật khi phiếu đã được tiếp nhận.");
    const nextStatus = data.isWarrantyEligible ? warranties_status.INSPECTING : warranties_status.WAITING_CUSTOMER_CONFIRMATION;
    const updatedWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: nextStatus,
        action: "INSPECTED",
        note: data.note,
        data: {
            inspection_note: data.inspectionNote ?? undefined,
            inspection_result: data.inspectionResult,
            is_warranty_eligible: data.isWarrantyEligible,
            estimated_cost: data.estimatedCost ?? undefined,
        },
    });
    return { warranty: updatedWarranty };
};
export const startRepairWarrantyService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [warranties_status.INSPECTING, warranties_status.WAITING_CUSTOMER_CONFIRMATION, warranties_status.BRAND_RETURNED], "Chỉ có thể bắt đầu sửa chữa sau khi đã kiểm tra hoặc hãng đã trả máy.");
    const updatedWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: warranties_status.IN_PROGRESS,
        action: "REPAIR_STARTED",
        note: data.note,
        data: {
            expected_return_date: parseOptionalDate(data.expectedReturnDate),
            repair_actions: data.repairActions ?? undefined,
            accessory_changed: data.accessoryChanged ?? undefined,
        },
    });
    return { warranty: updatedWarranty };
};
export const sendToBrandWarrantyService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [warranties_status.INSPECTING, warranties_status.IN_PROGRESS], "Chỉ có thể gửi hãng khi phiếu đang kiểm tra hoặc đang xử lý.");
    const updatedWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: warranties_status.SENT_TO_BRAND,
        action: "SENT_TO_BRAND",
        note: data.note,
        data: {
            sent_to_brand_at: new Date(),
            brand_name: data.brandName,
            brand_ticket_code: data.brandTicketCode ?? undefined,
        },
    });
    return { warranty: updatedWarranty };
};
export const brandReturnedWarrantyService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [warranties_status.SENT_TO_BRAND], "Chỉ có thể xác nhận hãng trả máy với phiếu đã gửi hãng.");
    const updatedWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: warranties_status.BRAND_RETURNED,
        action: "BRAND_RETURNED",
        note: data.note,
        data: { brand_returned_at: new Date() },
    });
    return { warranty: updatedWarranty };
};
export const completeWarrantyService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [warranties_status.IN_PROGRESS, warranties_status.BRAND_RETURNED], "Chỉ có thể hoàn tất phiếu đang sửa chữa hoặc đã nhận lại từ hãng.");
    const updatedWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: warranties_status.COMPLETED,
        action: "COMPLETE",
        note: data.note,
        data: {
            repair_actions: data.repairActions ?? undefined,
            accessory_changed: data.accessoryChanged ?? undefined,
            expected_return_date: parseOptionalDate(data.expectedReturnDate),
            completed_at: new Date(),
        },
    });
    return { warranty: updatedWarranty };
};
export const scheduleReturnWarrantyService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [warranties_status.COMPLETED], "Chỉ có thể hẹn trả máy khi phiếu đã hoàn tất xử lý.");
    const updatedWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: warranties_status.RETURN_SCHEDULED,
        action: "RETURN_SCHEDULED",
        note: data.note,
        data: {
            return_method: data.returnMethod,
            return_receiver_name: data.returnReceiverName ?? undefined,
            return_phone: data.returnPhone ?? undefined,
            return_address: data.returnAddress ?? undefined,
            return_scheduled_at: parseOptionalDate(data.returnScheduledAt),
        },
    });
    return { warranty: updatedWarranty };
};
export const returnWarrantyService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [warranties_status.COMPLETED, warranties_status.RETURN_SCHEDULED], "Chỉ có thể trả máy khi phiếu đã hoàn tất hoặc đã hẹn trả.");
    const updateWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: warranties_status.RETURNED,
        action: "RETURN_TO_CUSTOMER",
        note: data.note,
        data: {
            return_date: new Date(),
            returned_at: new Date(),
        },
        deviceStatus: devices_status.SOLD,
    });
    return { warranty: updateWarranty };
};
export const cancelWarrantyService = async (employeeId, warrantyId, data) => {
    const warranty = await findWarrantyById(warrantyId);
    if (!warranty)
        throw new AppError("Không tìm thấy phiếu bảo hành.", 404);
    assertWarrantyStatus(warranty.status, [
        warranties_status.REQUESTED,
        warranties_status.APPROVED,
        warranties_status.CUSTOMER_DROP_OFF,
        warranties_status.PICKUP_SCHEDULED,
        warranties_status.PICKED_UP,
        warranties_status.RECEIVED,
        warranties_status.INSPECTING,
        warranties_status.WAITING_CUSTOMER_CONFIRMATION,
        warranties_status.IN_PROGRESS,
        warranties_status.SENT_TO_BRAND,
        warranties_status.BRAND_RETURNED,
        warranties_status.COMPLETED,
        warranties_status.RETURN_SCHEDULED,
    ], "Không thể hủy phiếu đã kết thúc.");
    const updateWarranty = await updateWarrantyStatusWithProcess({
        warrantyId,
        employeeId,
        status: warranties_status.CANCELLED,
        action: "CANCEL",
        note: data.note,
        deviceStatus: devices_status.SOLD,
    });
    return { warranty: updateWarranty };
};
