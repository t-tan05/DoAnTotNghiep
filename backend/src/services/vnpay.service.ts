import crypto from "crypto";
import AppError from "#utils/AppError";

type VnpayParams = Record<string, string | number>;

function sortObject(obj: VnpayParams) {
    const sorted: Record<string, string | number> = {};

    Object.keys(obj)
        .sort()
        .forEach((key) => {
            sorted[key] = obj[key];
        });

    return sorted;
}

function vnpayEncode(value: string | number) {
    return encodeURIComponent(String(value)).replace(/%20/g, "+");
}

function buildVnpayQuery(params: VnpayParams) {
    return Object.keys(params)
        .sort()
        .filter((key) => {
            const value = params[key];
            return value !== null && value !== undefined && String(value).length > 0;
        })
        .map((key) => `${vnpayEncode(key)}=${vnpayEncode(params[key])}`)
        .join("&");
}

function formatDate(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, "0");

    return (
        date.getFullYear().toString() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) + 
        pad(date.getMinutes()) +
        pad(date.getSeconds())
    );
}

function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60 * 1000);
}

export function createVnpayPaymentUrl(params: {
    txnRef: string;
    orderId: string;
    amount: number;
    ipAddr: string;
    expireAt?: Date;
}) {
    const tmnCode = process.env.VNPAY_TMN_CODE?.trim();
    const hashSecret = process.env.VNPAY_HASH_SECRET?.trim();
    const vnpUrl = process.env.VNPAY_URL?.trim();
    const returnUrl = process.env.VNPAY_RETURN_URL?.trim();

    if(!tmnCode || !hashSecret || !vnpUrl || !returnUrl) {
        throw new AppError("Thiếu cấu hình VNPay.", 500);
    }

    const now = new Date();
    const createDate = formatDate(now);
    const expireDate = formatDate(params.expireAt ?? addMinutes(now, 15));

    let vnpParams: VnpayParams = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: params.txnRef,
        vnp_OrderInfo: `Thanh toan don hang ${params.orderId}`,
        vnp_OrderType: "other",
        vnp_Amount: Math.round(params.amount) * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: params.ipAddr,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
    };

    vnpParams = sortObject(vnpParams);

    const signData = buildVnpayQuery(vnpParams);

    const hmac = crypto.createHmac("sha512", hashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    return `${vnpUrl}?${signData}&vnp_SecureHash=${signed}`;
};

export function verifyVnpayReturn(query: Record<string, any>) {
    const hashSecret = process.env.VNPAY_HASH_SECRET?.trim();

    if(!hashSecret) {
        throw new AppError("Thiếu cấu hình VNPay", 500);
    }

    const secureHash = query.vnp_SecureHash;

    const params = {...query};
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sortedParams = sortObject(params);

    const signData = buildVnpayQuery(sortedParams);

    const signed = crypto
        .createHmac("sha512", hashSecret)
        .update(Buffer.from(signData, "utf-8"))
        .digest("hex");

    return String(secureHash).toLowerCase() === signed.toLowerCase();
}

export async function refundVnpayPayment(params: {
    txnRef: string;
    orderId: string;
    amount: number;
    transactionCode: string;
    transactionDate: Date;
    createBy: string;
    ipAddr: string;
}) {
    const tmnCode = process.env.VNPAY_TMN_CODE?.trim();
    const hashSecret = process.env.VNPAY_HASH_SECRET?.trim();
    const refundUrl = process.env.VNPAY_REFUND_URL?.trim();

    if(!tmnCode || !hashSecret || !refundUrl) {
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
        vnp_TxnRef: params.txnRef,
        vnp_Amount: amount,
        vnp_TransactionNo: params.transactionCode,
        vnp_TransactionDate: transactionDate,
        vnp_CreateBy: params.createBy,
        vnp_CreateDate: createDate,
        vnp_IpAddr: params.ipAddr,
        vnp_OrderInfo: `Hoan tien don hang ${params.orderId}`,
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

    if(!response.ok) {
        throw new AppError("Không gọi được API hoàn tiền VNPay.", 502);
    }

    return data;
}
