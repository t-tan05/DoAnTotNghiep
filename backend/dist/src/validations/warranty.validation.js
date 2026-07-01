import Joi from "joi";
import { warranties_status, warranty_request_channel, warranty_service_method } from "@prisma/client";
const optionalNote = Joi.string().trim().allow("", null);
export const createWarrantySchema = Joi.object({
    serialNumber: Joi.string().trim().required().messages({
        "string.empty": "Số seri không được để trống.",
        "any.required": "Số seri là bắt buộc.",
    }),
    issueCategoryId: Joi.string().trim().allow("", null),
    issueDescription: Joi.string().trim().min(5).max(2000).required().messages({
        "string.empty": "Mô tả vấn đề không được để trống.",
        "string.min": "Mô tả vấn đề ít nhất 5 ký tự.",
        "any.required": "Mô tả vấn đề là bắt buộc.",
    }),
    serviceMethod: Joi.string().valid(...Object.values(warranty_service_method)).default(warranty_service_method.PICKUP),
    pickupReceiverName: Joi.string().trim().max(100).allow("", null),
    pickupPhone: Joi.string().trim().max(20).allow("", null),
    pickupAddress: Joi.string().trim().max(500).allow("", null),
    note: optionalNote,
});
export const warrantyNoteSchema = Joi.object({
    note: optionalNote,
});
export const schedulePickupSchema = Joi.object({
    pickupReceiverName: Joi.string().trim().max(100).required(),
    pickupPhone: Joi.string().trim().max(20).required(),
    pickupAddress: Joi.string().trim().max(500).required(),
    pickupScheduledAt: Joi.date().iso().required(),
    note: optionalNote,
});
export const inspectWarrantySchema = Joi.object({
    inspectionNote: optionalNote,
    inspectionResult: Joi.string().trim().min(5).max(3000).required(),
    isWarrantyEligible: Joi.boolean().required(),
    estimatedCost: Joi.number().min(0).allow(null),
    policyId: Joi.string().trim().allow("", null),
    note: optionalNote,
});
export const addWarrantyProcessSchema = Joi.object({
    action: Joi.string().trim().max(50).required(),
    note: optionalNote,
    expectedReturnDate: Joi.date().iso().allow(null),
    repairActions: optionalNote,
    accessoryChanged: optionalNote,
});
export const repairWarrantySchema = Joi.object({
    note: optionalNote,
    expectedReturnDate: Joi.date().iso().allow(null),
    repairActions: optionalNote,
    accessoryChanged: optionalNote,
});
export const sendToBrandSchema = Joi.object({
    brandName: Joi.string().trim().max(100).required(),
    brandTicketCode: Joi.string().trim().max(100).allow("", null),
    note: optionalNote,
});
export const scheduleReturnSchema = Joi.object({
    returnMethod: Joi.string().valid(...Object.values(warranty_service_method)).required(),
    returnReceiverName: Joi.string().trim().max(100).allow("", null),
    returnPhone: Joi.string().trim().max(20).allow("", null),
    returnAddress: Joi.string().trim().max(500).allow("", null),
    returnScheduledAt: Joi.date().iso().allow(null),
    note: optionalNote,
});
export const warrantyStatusSchema = warrantyNoteSchema;
export const warrantyListQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    search: Joi.string().trim().allow("", null),
    status: Joi.string().valid(...Object.values(warranties_status)).allow("", null),
    requestChannel: Joi.string().valid(...Object.values(warranty_request_channel)).allow("", null),
    serviceMethod: Joi.string().valid(...Object.values(warranty_service_method)).allow("", null),
    employeeId: Joi.string().trim().allow("", null),
    fromDate: Joi.date().iso().allow(null),
    toDate: Joi.date().iso().allow(null),
    sortBy: Joi.string().valid("received_date", "created_at", "updated_at", "pickup_scheduled_at", "return_scheduled_at").default("created_at"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});
