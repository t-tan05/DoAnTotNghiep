import { Badge } from "@/components/ui/badge";
import type { WarrantyStatus } from "@/types/warranty.type";

const statusLabels: Record<WarrantyStatus, string> = {
    REQUESTED: "Chờ tiếp nhận",
    APPROVED: "Đã duyệt",
    REJECTED: "Đã từ chối",
    CUSTOMER_DROP_OFF: "Khách mang máy tới cửa hàng",
    PICKUP_SCHEDULED: "Đã hẹn lấy máy",
    PICKED_UP: "Đã lấy máy",
    RECEIVED: "Đã nhận máy",
    INSPECTING: "Đang kiểm tra",
    WAITING_CUSTOMER_CONFIRMATION: "Chờ khách xác nhận",
    IN_PROGRESS: "Đang xử lý",
    SENT_TO_BRAND: "Đã gửi hãng",
    BRAND_RETURNED: "Hãng đã trả máy",
    COMPLETED: "Đã xử lý xong",
    RETURN_SCHEDULED: "Đã hẹn trả máy",
    RETURNED: "Đã trả máy",
    CANCELLED: "Đã hủy",
};

const statusClasses: Partial<Record<WarrantyStatus, string>> = {
    REQUESTED: "bg-amber-50 text-amber-700",
    APPROVED: "bg-blue-50 text-blue-700",
    INSPECTING: "bg-blue-50 text-blue-700",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    SENT_TO_BRAND: "bg-purple-50 text-purple-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    RETURNED: "bg-emerald-50 text-emerald-700",
    REJECTED: "bg-red-50 text-red-700",
    CANCELLED: "bg-red-50 text-red-700",
};

export function getWarrantyStatusLabel(status: WarrantyStatus) {
    return statusLabels[status] || status;
}

export default function WarrantyStatusBadge({status}: {status: WarrantyStatus}) {
    return (
        <Badge
            variant="secondary"
            className={statusClasses[status] || "bg-muted text-foreground"}
        >
            {getWarrantyStatusLabel(status)}
        </Badge>
    );
}
