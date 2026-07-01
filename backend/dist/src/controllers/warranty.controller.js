import { addWarrantyProcessService, approveWarrantyService, brandReturnedWarrantyService, cancelWarrantyService, completeWarrantyService, createWarrantyService, getAllWarrantiesService, getMyWarrantyDetailService, getMyWarrantiesService, getWarrantyDetailService, inspectWarrantyService, lookupWarrantyBySerialService, markCustomerDropOffWarrantyService, markPickedUpWarrantyService, receiveWarrantyService, rejectWarrantyService, returnWarrantyService, schedulePickupWarrantyService, scheduleReturnWarrantyService, sendToBrandWarrantyService, startRepairWarrantyService, } from "#services/warranty.service";
import { CatchAsync } from "#utils/CatchAsync";
import { warranties_status, warranty_request_channel, warranty_service_method } from "@prisma/client";
import { getIO } from "../socket.js";
const getWarrantyStatusQuery = (value) => {
    return typeof value === "string" && Object.values(warranties_status).includes(value)
        ? value
        : undefined;
};
const getRequestChannelQuery = (value) => {
    return typeof value === "string" && Object.values(warranty_request_channel).includes(value)
        ? value
        : undefined;
};
const getServiceMethodQuery = (value) => {
    return typeof value === "string" && Object.values(warranty_service_method).includes(value)
        ? value
        : undefined;
};
const emitWarrantyNew = (warranty) => {
    getIO().to("warranty_staff").emit("warranty:new", {
        warrantyId: warranty.warranty_id,
        warrantyCode: warranty.warranty_code,
        status: warranty.status,
        customerId: warranty.customer_id,
        deviceId: warranty.device_id,
        serialNumber: warranty.devices?.serial_number,
        createdAt: warranty.created_at,
    });
};
const emitWarrantyUpdated = (warranty, eventType = "updated") => {
    const payload = {
        eventType,
        warrantyId: warranty.warranty_id,
        warrantyCode: warranty.warranty_code,
        status: warranty.status,
        customerId: warranty.customer_id,
        deviceId: warranty.device_id,
        assignedEmployeeId: warranty.assigned_employee_id,
        updatedAt: warranty.updated_at || new Date(),
    };
    getIO().to("warranty_staff").emit("warranty:updated", payload);
    getIO().to(`warranty_user:${warranty.customer_id}`).emit("warranty:status_changed", payload);
    getIO().to(`warranty_detail:${warranty.warranty_id}`).emit("warranty:process_added", payload);
};
const sendWarrantyResponse = (res, message, data) => {
    res.status(200).json({
        success: true,
        message,
        data,
    });
};
export const lookupWarrantyBySerialController = CatchAsync(async (req, res) => {
    const serialNumber = String(req.query.serialNumber || "");
    const data = await lookupWarrantyBySerialService(serialNumber);
    res.status(200).json({
        success: true,
        message: "Kiểm tra serial bảo hành thành công.",
        data,
    });
});
export const createWarrantyController = CatchAsync(async (req, res) => {
    const data = await createWarrantyService(req.user.user_id, req.body);
    if (data.warranty)
        emitWarrantyNew(data.warranty);
    res.status(201).json({
        success: true,
        message: "Tạo yêu cầu bảo hành thành công.",
        data,
    });
});
export const getMyWarrantiesController = CatchAsync(async (req, res) => {
    const data = await getMyWarrantiesService(req.user.user_id, Number(req.query.page || 1), Number(req.query.limit || 10));
    sendWarrantyResponse(res, "Lấy danh sách bảo hành của bạn thành công.", data);
});
export const getMyWarrantyDetailController = CatchAsync(async (req, res) => {
    const data = await getMyWarrantyDetailService(req.params.warrantyId, req.user.user_id);
    sendWarrantyResponse(res, "Lấy chi tiết bảo hành của bạn thành công.", data);
});
export const getAllWarrantiesController = CatchAsync(async (req, res) => {
    const data = await getAllWarrantiesService({
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 10),
        search: req.query.search,
        status: getWarrantyStatusQuery(req.query.status),
        requestChannel: getRequestChannelQuery(req.query.requestChannel),
        serviceMethod: getServiceMethodQuery(req.query.serviceMethod),
        employeeId: req.query.employeeId,
        fromDate: req.query.fromDate,
        toDate: req.query.toDate,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
    });
    sendWarrantyResponse(res, "Lấy danh sách bảo hành thành công.", data);
});
export const getWarrantyDetailController = CatchAsync(async (req, res) => {
    const data = await getWarrantyDetailService(req.params.warrantyId);
    sendWarrantyResponse(res, "Lấy chi tiết bảo hành thành công.", data);
});
export const approveWarrantyController = CatchAsync(async (req, res) => {
    const data = await approveWarrantyService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "approved");
    sendWarrantyResponse(res, "Duyệt yêu cầu bảo hành thành công.", data);
});
export const rejectWarrantyController = CatchAsync(async (req, res) => {
    const data = await rejectWarrantyService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "rejected");
    sendWarrantyResponse(res, "Từ chối yêu cầu bảo hành thành công.", data);
});
export const markCustomerDropOffWarrantyController = CatchAsync(async (req, res) => {
    const data = await markCustomerDropOffWarrantyService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "customer_drop_off");
    sendWarrantyResponse(res, "Cập nhật hình thức khách mang máy tới cửa hàng thành công.", data);
});
export const schedulePickupWarrantyController = CatchAsync(async (req, res) => {
    const data = await schedulePickupWarrantyService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "pickup_scheduled");
    sendWarrantyResponse(res, "Hẹn lấy máy bảo hành thành công.", data);
});
export const markPickedUpWarrantyController = CatchAsync(async (req, res) => {
    const data = await markPickedUpWarrantyService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "picked_up");
    sendWarrantyResponse(res, "Xác nhận đã lấy máy thành công.", data);
});
export const receiveWarrantyController = CatchAsync(async (req, res) => {
    const data = await receiveWarrantyService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "received");
    sendWarrantyResponse(res, "Tiếp nhận máy bảo hành thành công.", data);
});
export const inspectWarrantyController = CatchAsync(async (req, res) => {
    const data = await inspectWarrantyService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "inspected");
    sendWarrantyResponse(res, "Cập nhật kết quả kiểm tra bảo hành thành công.", data);
});
export const addWarrantyProcessController = CatchAsync(async (req, res) => {
    const data = await addWarrantyProcessService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "process_added");
    sendWarrantyResponse(res, "Cập nhật quy trình bảo hành thành công.", data);
});
export const startRepairWarrantyController = CatchAsync(async (req, res) => {
    const data = await startRepairWarrantyService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "repair_started");
    sendWarrantyResponse(res, "Bắt đầu xử lý bảo hành thành công.", data);
});
export const sendToBrandWarrantyController = CatchAsync(async (req, res) => {
    const data = await sendToBrandWarrantyService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "sent_to_brand");
    sendWarrantyResponse(res, "Cập nhật gửi hãng bảo hành thành công.", data);
});
export const brandReturnedWarrantyController = CatchAsync(async (req, res) => {
    const data = await brandReturnedWarrantyService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "brand_returned");
    sendWarrantyResponse(res, "Cập nhật hãng trả máy thành công.", data);
});
export const completeWarrantyController = CatchAsync(async (req, res) => {
    const data = await completeWarrantyService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "completed");
    sendWarrantyResponse(res, "Hoàn tất xử lý bảo hành thành công.", data);
});
export const scheduleReturnWarrantyController = CatchAsync(async (req, res) => {
    const data = await scheduleReturnWarrantyService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "return_scheduled");
    sendWarrantyResponse(res, "Hẹn trả máy bảo hành thành công.", data);
});
export const returnWarrantyController = CatchAsync(async (req, res) => {
    const data = await returnWarrantyService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "returned");
    sendWarrantyResponse(res, "Trả máy bảo hành thành công.", data);
});
export const cancelWarrantyController = CatchAsync(async (req, res) => {
    const data = await cancelWarrantyService(req.user.user_id, req.params.warrantyId, req.body);
    if (data.warranty)
        emitWarrantyUpdated(data.warranty, "cancelled");
    sendWarrantyResponse(res, "Hủy phiếu bảo hành thành công.", data);
});
