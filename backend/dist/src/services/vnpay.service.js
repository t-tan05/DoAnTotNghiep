import crypto from "crypto";
import qs from "qs";
import AppError from "#utils/AppError";
function sortObject(obj) {
    const sorted = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
        sorted[key] = obj[key];
    });
    return sorted;
}
function formatDate(date) {
    const pad = (n) => n.toString().padStart(2, "0");
    return (date.getFullYear().toString() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds()));
}
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60 * 1000);
}
export function createVnpayPaymentUrl(params) {
    const tmnCode = process.env.VNPAY_TMN_CODE;
    const hashSecret = process.env.VNPAY_HASH_SECRET;
    const vnpUrl = process.env.VNPAY_URL;
    const returnUrl = process.env.VNPAY_RETURN_URL;
    if (!tmnCode || !hashSecret || !vnpUrl || !returnUrl) {
        throw new AppError("Thiếu cấu hình VNPay.", 500);
    }
    const now = new Date();
    const createDate = formatDate(now);
    const expireDate = formatDate(addMinutes(now, 15));
    let vnpParams = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: params.orderId,
        vnp_OrderInfo: `Thanh toán đơn hàng ${params.orderId}`,
        vnp_OrderType: "other",
        vnp_Amount: Math.round(params.amount) * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: params.ipAddr,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
    };
    vnpParams = sortObject(vnpParams);
    const signData = qs.stringify(vnpParams, {
        encode: false,
    });
    const hmac = crypto.createHmac("sha512", hashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnpParams.vnp_SecureHash = signed;
    return `${vnpUrl}?${qs.stringify(vnpParams, { encode: false })}`;
}
;
export function verifyVnpayReturn(query) {
    const hashSecret = process.env.VNPAY_HASH_SECRET;
    if (!hashSecret) {
        throw new AppError("Thiếu cấu hình VNPay", 500);
    }
    const secureHash = query.vnp_SecureHash;
    const params = { ...query };
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;
    const sortedParams = sortObject(params);
    const signData = qs.stringify(sortedParams, {
        encode: false,
    });
    const signed = crypto
        .createHmac("sha512", hashSecret)
        .update(Buffer.from(signData, "utf-8"))
        .digest("hex");
    return secureHash === signed;
}
export async function refundVnpayPayment(params) {
    const tmnCode = process.env.VNPAY_TMN_CODE;
    const hashSecret = process.env.VNPAY_HASH_SECRET;
    const refundUrl = process.env.VNPAY_REFUND_URL;
    if (!tmnCode || !hashSecret || !refundUrl) {
        throw new AppError("Thiếu cấu hình hoàn tiền VNPay.", 500);
    }
    const requestId = crypto.randomUUID();
    const createDate = formatDate(new Date());
    const transactionDate = formatDate(params.transactionDate);
    const amount = Math.round(params.amount) * 100;
    const vnpParams = {
        vnp_RequestId: requestId,
        vnp_Version: "2.1.0",
        vnp_Command: "refund",
        vnp_TmnCode: tmnCode,
        vnp_TransactionType: "02",
        vnp_TxnRef: params.orderId,
        vnp_Amount: amount,
        vnp_TransactionNo: params.transactionCode,
        vnp_TransactionDate: transactionDate,
        vnp_CreateBy: params.createBy,
        vnp_CreateDate: createDate,
        vnp_IpAddr: params.ipAddr,
        vnp_OrderInfo: `Hoàn tiền đơn hàng ${params.orderId}`,
    };
    const signData = [
        vnpParams.vnp_RequestId,
        vnpParams.vnp_Version,
        vnpParams.vnp_Command,
        vnpParams.vnp_TmnCode,
        vnpParams.vnp_TransactionType,
        vnpParams.vnp_TxnRef,
        vnpParams.vnp_Amount,
        vnpParams.vnp_TransactionNo,
        vnpParams.vnp_TransactionDate,
        vnpParams.vnp_CreateBy,
        vnpParams.vnp_CreateDate,
        vnpParams.vnp_IpAddr,
        vnpParams.vnp_OrderInfo,
    ].join("|");
    const secureHash = crypto
        .createHmac("sha512", hashSecret)
        .update(Buffer.from(signData, "utf-8"))
        .digest("hex");
    const response = await fetch(refundUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...vnpParams,
            vnp_SecureHash: secureHash,
        }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new AppError("Không gọi được API hoàn tiền VNPay.", 502);
    }
    return data;
}
