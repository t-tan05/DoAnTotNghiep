import Joi from "joi";
import { warranties_status, warranty_request_channel, warranty_service_method } from "@prisma/client";
const optionalNote = Joi.string()
    .trim()
    .allow("", null)
    .messages({
    "string.base": "Ghi chú phải là chuỗi ký tự.",
});
export const createWarrantySchema = Joi.object({
    serialNumber: Joi.string()
        .trim()
        .empty("")
        .allow(null)
        .messages({
        "string.base": "Số seri phải là chuỗi ký tự.",
        "string.empty": "Số seri không được để trống.",
    }),
    deviceId: Joi.string()
        .trim()
        .empty("")
        .allow(null)
        .messages({
        "string.base": "Mã thiết bị phải là chuỗi ký tự.",
        "string.empty": "Mã thiết bị không được để trống.",
    }),
    issueDescription: Joi.string()
        .trim()
        .min(5)
        .max(2000)
        .required()
        .messages({
        "string.base": "Mô tả vấn đề phải là chuỗi ký tự.",
        "string.empty": "Mô tả vấn đề không được để trống.",
        "string.min": "Mô tả vấn đề phải có ít nhất 5 ký tự.",
        "string.max": "Mô tả vấn đề tối đa 2000 ký tự.",
        "any.required": "Mô tả vấn đề là bắt buộc.",
    }),
    serviceMethod: Joi.string()
        .valid(...Object.values(warranty_service_method))
        .default(warranty_service_method.PICKUP)
        .messages({
        "string.base": "Phương thức bảo hành phải là chuỗi ký tự.",
        "any.only": "Phương thức bảo hành không hợp lệ.",
    }),
    pickupReceiverName: Joi.string()
        .trim()
        .max(100)
        .allow("", null)
        .messages({
        "string.base": "Tên người nhận phải là chuỗi ký tự.",
        "string.max": "Tên người nhận tối đa 100 ký tự.",
    }),
    pickupPhone: Joi.string()
        .trim()
        .max(20)
        .allow("", null)
        .messages({
        "string.base": "Số điện thoại phải là chuỗi ký tự.",
        "string.max": "Số điện thoại tối đa 20 ký tự.",
    }),
    pickupAddress: Joi.string()
        .trim()
        .max(500)
        .allow("", null)
        .messages({
        "string.base": "Địa chỉ nhận thiết bị phải là chuỗi ký tự.",
        "string.max": "Địa chỉ nhận thiết bị tối đa 500 ký tự.",
    }),
    note: optionalNote,
}).or("serialNumber", "deviceId").messages({
    "object.missing": "Vui lòng chọn sản phẩm hoặc nhập số seri cần bảo hành.",
});
export const warrantyNoteSchema = Joi.object({
    note: optionalNote,
});
export const schedulePickupSchema = Joi.object({
    pickupReceiverName: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
        "string.base": "Tên người nhận phải là chuỗi ký tự.",
        "string.empty": "Tên người nhận không được để trống.",
        "string.max": "Tên người nhận tối đa 100 ký tự.",
        "any.required": "Tên người nhận là bắt buộc.",
    }),
    pickupPhone: Joi.string()
        .trim()
        .max(20)
        .required()
        .messages({
        "string.base": "Số điện thoại phải là chuỗi ký tự.",
        "string.empty": "Số điện thoại không được để trống.",
        "string.max": "Số điện thoại tối đa 20 ký tự.",
        "any.required": "Số điện thoại là bắt buộc.",
    }),
    pickupAddress: Joi.string()
        .trim()
        .max(500)
        .required()
        .messages({
        "string.base": "Địa chỉ nhận thiết bị phải là chuỗi ký tự.",
        "string.empty": "Địa chỉ nhận thiết bị không được để trống.",
        "string.max": "Địa chỉ nhận thiết bị tối đa 500 ký tự.",
        "any.required": "Địa chỉ nhận thiết bị là bắt buộc.",
    }),
    pickupScheduledAt: Joi.date()
        .iso()
        .required()
        .messages({
        "date.base": "Thời gian nhận thiết bị không hợp lệ.",
        "date.format": "Thời gian nhận thiết bị phải đúng định dạng ISO.",
        "any.required": "Thời gian nhận thiết bị là bắt buộc.",
    }),
    note: optionalNote,
});
export const inspectWarrantySchema = Joi.object({
    inspectionNote: optionalNote,
    inspectionResult: Joi.string()
        .trim()
        .min(5)
        .max(3000)
        .required()
        .messages({
        "string.base": "Kết quả kiểm tra phải là chuỗi ký tự.",
        "string.empty": "Kết quả kiểm tra không được để trống.",
        "string.min": "Kết quả kiểm tra phải có ít nhất 5 ký tự.",
        "string.max": "Kết quả kiểm tra tối đa 3000 ký tự.",
        "any.required": "Kết quả kiểm tra là bắt buộc.",
    }),
    isWarrantyEligible: Joi.boolean()
        .required()
        .messages({
        "boolean.base": "Trạng thái đủ điều kiện bảo hành không hợp lệ.",
        "any.required": "Kết quả xác định điều kiện bảo hành là bắt buộc.",
    }),
    estimatedCost: Joi.number()
        .min(0)
        .allow(null)
        .messages({
        "number.base": "Chi phí dự kiến phải là số.",
        "number.min": "Chi phí dự kiến không được nhỏ hơn 0.",
    }),
    note: optionalNote,
});
export const addWarrantyProcessSchema = Joi.object({
    action: Joi.string()
        .trim()
        .max(50)
        .required()
        .messages({
        "string.base": "Hành động xử lý phải là chuỗi ký tự.",
        "string.empty": "Hành động xử lý không được để trống.",
        "string.max": "Hành động xử lý tối đa 50 ký tự.",
        "any.required": "Hành động xử lý là bắt buộc.",
    }),
    note: optionalNote,
    expectedReturnDate: Joi.date()
        .iso()
        .allow(null)
        .messages({
        "date.base": "Ngày dự kiến hoàn trả không hợp lệ.",
        "date.format": "Ngày dự kiến hoàn trả phải đúng định dạng ISO.",
    }),
    repairActions: optionalNote,
    accessoryChanged: optionalNote,
});
export const repairWarrantySchema = Joi.object({
    note: optionalNote,
    expectedReturnDate: Joi.date()
        .iso()
        .allow(null)
        .messages({
        "date.base": "Ngày dự kiến hoàn trả không hợp lệ.",
        "date.format": "Ngày dự kiến hoàn trả phải đúng định dạng ISO.",
    }),
    repairActions: optionalNote,
    accessoryChanged: optionalNote,
});
export const sendToBrandSchema = Joi.object({
    brandName: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
        "string.base": "Tên hãng phải là chuỗi ký tự.",
        "string.empty": "Tên hãng không được để trống.",
        "string.max": "Tên hãng tối đa 100 ký tự.",
        "any.required": "Tên hãng là bắt buộc.",
    }),
    brandTicketCode: Joi.string()
        .trim()
        .max(100)
        .allow("", null)
        .messages({
        "string.base": "Mã tiếp nhận của hãng phải là chuỗi ký tự.",
        "string.max": "Mã tiếp nhận của hãng tối đa 100 ký tự.",
    }),
    note: optionalNote,
});
export const scheduleReturnSchema = Joi.object({
    returnMethod: Joi.string()
        .valid(...Object.values(warranty_service_method))
        .required()
        .messages({
        "string.base": "Phương thức hoàn trả phải là chuỗi ký tự.",
        "any.only": "Phương thức hoàn trả không hợp lệ.",
        "any.required": "Phương thức hoàn trả là bắt buộc.",
    }),
    returnReceiverName: Joi.string()
        .trim()
        .max(100)
        .allow("", null)
        .messages({
        "string.base": "Tên người nhận phải là chuỗi ký tự.",
        "string.max": "Tên người nhận tối đa 100 ký tự.",
    }),
    returnPhone: Joi.string()
        .trim()
        .max(20)
        .allow("", null)
        .messages({
        "string.base": "Số điện thoại người nhận phải là chuỗi ký tự.",
        "string.max": "Số điện thoại người nhận tối đa 20 ký tự.",
    }),
    returnAddress: Joi.string()
        .trim()
        .max(500)
        .allow("", null)
        .messages({
        "string.base": "Địa chỉ hoàn trả phải là chuỗi ký tự.",
        "string.max": "Địa chỉ hoàn trả tối đa 500 ký tự.",
    }),
    returnScheduledAt: Joi.date()
        .iso()
        .allow(null)
        .messages({
        "date.base": "Thời gian hoàn trả không hợp lệ.",
        "date.format": "Thời gian hoàn trả phải đúng định dạng ISO.",
    }),
    note: optionalNote,
});
export const warrantyStatusSchema = warrantyNoteSchema;
export const warrantyListQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
        "number.base": "Số trang phải là số.",
        "number.integer": "Số trang phải là số nguyên.",
        "number.min": "Số trang phải lớn hơn hoặc bằng 1.",
    }),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(10)
        .messages({
        "number.base": "Số lượng bản ghi phải là số.",
        "number.integer": "Số lượng bản ghi phải là số nguyên.",
        "number.min": "Số lượng bản ghi phải lớn hơn hoặc bằng 1.",
        "number.max": "Số lượng bản ghi tối đa là 50.",
    }),
    search: Joi.string()
        .trim()
        .allow("", null)
        .messages({
        "string.base": "Từ khóa tìm kiếm phải là chuỗi ký tự.",
    }),
    status: Joi.string()
        .valid(...Object.values(warranties_status))
        .allow("", null)
        .messages({
        "string.base": "Trạng thái bảo hành phải là chuỗi ký tự.",
        "any.only": "Trạng thái bảo hành không hợp lệ.",
    }),
    requestChannel: Joi.string()
        .valid(...Object.values(warranty_request_channel))
        .allow("", null)
        .messages({
        "string.base": "Kênh tiếp nhận phải là chuỗi ký tự.",
        "any.only": "Kênh tiếp nhận bảo hành không hợp lệ.",
    }),
    serviceMethod: Joi.string()
        .valid(...Object.values(warranty_service_method))
        .allow("", null)
        .messages({
        "string.base": "Phương thức bảo hành phải là chuỗi ký tự.",
        "any.only": "Phương thức bảo hành không hợp lệ.",
    }),
    employeeId: Joi.string()
        .trim()
        .allow("", null)
        .messages({
        "string.base": "Mã nhân viên phải là chuỗi ký tự.",
    }),
    fromDate: Joi.date()
        .iso()
        .allow(null)
        .messages({
        "date.base": "Ngày bắt đầu không hợp lệ.",
        "date.format": "Ngày bắt đầu phải đúng định dạng ISO.",
    }),
    toDate: Joi.date()
        .iso()
        .allow(null)
        .messages({
        "date.base": "Ngày kết thúc không hợp lệ.",
        "date.format": "Ngày kết thúc phải đúng định dạng ISO.",
    }),
    sortBy: Joi.string()
        .valid("received_date", "created_at", "updated_at", "pickup_scheduled_at", "return_scheduled_at")
        .default("created_at")
        .messages({
        "string.base": "Trường sắp xếp phải là chuỗi ký tự.",
        "any.only": "Trường sắp xếp không hợp lệ.",
    }),
    sortOrder: Joi.string()
        .valid("asc", "desc")
        .default("desc")
        .messages({
        "string.base": "Thứ tự sắp xếp phải là chuỗi ký tự.",
        "any.only": "Thứ tự sắp xếp chỉ được là asc hoặc desc.",
    }),
});
