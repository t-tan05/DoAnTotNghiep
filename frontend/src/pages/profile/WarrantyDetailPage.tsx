import PageLoading from "@/components/common/PageLoading";
import WarrantyStatusBadge, { getWarrantyStatusLabel } from "@/components/profile/WarrantyStatusBadge";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";
import { warrantyService } from "@/services/warranty.service";
import type { Warranty, WarrantyProcess } from "@/types/warranty.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { CalendarClock, CheckCircle2, ClipboardList, LifeBuoy, Package, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

function formatDateTime(value?: string | null) {
    if(!value) return "-";
    return new Date(value).toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

function formatMoney(value?: number | string | null) {
    if(value === null || value === undefined || value === "") return "-";
    return `${Number(value).toLocaleString("vi-VN")}đ`;
}

function getWarrantyImage(warranty: Warranty) {
    const variant = warranty.devices.product_variants;

    return (
        variant.image_url ||
        variant.product_images?.find((image) => image.is_default)?.image_url ||
        variant.product_images?.[0]?.image_url ||
        ""
    );
}

function getProductDetailLink(warranty: Warranty) {
    const variant = warranty.devices.product_variants;
    return `/products/${variant.products.product_id}?variantId=${variant.variant_id}`;
}

function getProcessTitle(process: WarrantyProcess) {
    const actionLabels: Record<string, string> = {
        CUSTOMER_REQUEST: "Khách tạo yêu cầu bảo hành",
        EMPLOYEE_APPROVED: "Nhân viên duyệt yêu cầu",
        EMPLOYEE_REJECTED: "Nhân viên từ chối yêu cầu",
        CUSTOMER_DROP_OFF: "Khách mang máy tới cửa hàng",
        PICKUP_SCHEDULED: "Đã hẹn lấy máy",
        PICKED_UP: "Đã lấy máy",
        RECEIVED: "Đã tiếp nhận máy",
        INSPECTED: "Đã kiểm tra thiết bị",
        PROCESS_ADDED: "Cập nhật quy trình",
        REPAIR_STARTED: "Bắt đầu xử lý",
        SENT_TO_BRAND: "Đã gửi hãng",
        BRAND_RETURNED: "Hãng đã trả máy",
        COMPLETED: "Hoàn tất xử lý",
        RETURN_SCHEDULED: "Đã hẹn trả máy",
        RETURNED: "Đã trả máy",
        CANCELLED: "Đã hủy phiếu",
    };

    return actionLabels[process.action] || process.action;
}

function InfoRow({label, value}: {label: string; value?: ReactNode}) {
    return (
        <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="mt-1 text-sm font-medium">{value || "-"}</div>
        </div>
    );
}

export default function WarrantyDetailPage() {
    const { warrantyId } = useParams();
    const [warranty, setWarranty] = useState<Warranty | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadWarranty = useCallback(async() => {
        if(!warrantyId) return;

        try {
            setLoading(true);
            setError("");

            const data = await warrantyService.getMyDetail(warrantyId);
            setWarranty(data.warranty);
        } catch(error) {
            setWarranty(null);
            setError(getErrorMessage(error));
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [warrantyId]);

    useEffect(() => {
        loadWarranty();
    }, [loadWarranty]);

    useEffect(() => {
        if(!warrantyId) return;

        const token = localStorage.getItem("accessToken");
        if(!token) return;

        function handleConnect() {
            socket.emit("join_warranty_detail", warrantyId);
        }

        function handleWarrantyChanged(payload: {warrantyId?: string}) {
            if(payload.warrantyId === warrantyId) {
                loadWarranty();
            }
        }

        socket.auth = { token };
        socket.on("connect", handleConnect);
        socket.on("warranty:status_changed", handleWarrantyChanged);
        socket.on("warranty:process_added", handleWarrantyChanged);

        if(!socket.connected) {
            socket.connect();
        } else {
            socket.emit("join_warranty_detail", warrantyId);
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("warranty:status_changed", handleWarrantyChanged);
            socket.off("warranty:process_added", handleWarrantyChanged);
        };
    }, [loadWarranty, warrantyId]);

    if(loading) {
        return <PageLoading text="Đang tải chi tiết bảo hành..." />;
    }

    if(error || !warranty) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                {error || "Không tìm thấy phiếu bảo hành."}
            </div>
        );
    }

    const variant = warranty.devices.product_variants;
    const productName = variant.variant_name || variant.products.product_name;
    const imageUrl = getWarrantyImage(warranty);

    return (
        <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-blue-700">
                        <LifeBuoy className="size-4" />
                        Phiếu bảo hành #{warranty.warranty_code}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold">Chi tiết bảo hành</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Cập nhật lúc: {formatDateTime(warranty.updated_at || warranty.created_at)}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <WarrantyStatusBadge status={warranty.status} />
                    <Button asChild variant="outline" className="cursor-pointer">
                        <Link to="/account/warranties">Quay lại</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-5">
                    <article className="rounded-xl border bg-white p-4 md:p-5">
                        <div className="flex items-center gap-2">
                            <Package className="size-5 text-blue-700" />
                            <h2 className="text-lg font-semibold">Thiết bị bảo hành</h2>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-[112px_1fr]">
                            <Link to={getProductDetailLink(warranty)} className="overflow-hidden rounded-lg border bg-muted transition hover:border-blue-700">
                                {imageUrl ? (
                                    <img src={imageUrl} alt={productName} className="aspect-square w-full object-cover" />
                                ) : (
                                    <div className="flex aspect-square items-center justify-center text-xs text-muted-foreground">
                                        No image
                                    </div>
                                )}
                            </Link>

                            <div className="min-w-0">
                                <h3 className="font-semibold">
                                    <Link to={getProductDetailLink(warranty)} className="hover:text-blue-700 hover:underline">
                                        {productName}
                                    </Link>
                                </h3>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <InfoRow label="SKU" value={variant.sku || "-"} />
                                    <InfoRow label="Serial" value={warranty.devices.serial_number} />
                                    <InfoRow label="Ngày bán" value={formatDateTime(warranty.devices.sold_date)} />
                                    <InfoRow label="Hạn bảo hành" value={formatDateTime(warranty.devices.warranty_end_date)} />
                                    <InfoRow label="Thương hiệu" value={variant.products.brands?.brand_name || "-"} />
                                    <InfoRow label="Danh mục" value={variant.products.categories?.category_name || "-"} />
                                </div>
                            </div>
                        </div>
                    </article>

                    <article className="rounded-xl border bg-white p-4 md:p-5">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="size-5 text-blue-700" />
                            <h2 className="text-lg font-semibold">Thông tin xử lý</h2>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <InfoRow label="Lỗi khách mô tả" value={warranty.issue_description} />
                            <InfoRow label="Ghi chú khách hàng" value={warranty.note || "-"} />
                            <InfoRow label="Kết quả kiểm tra" value={warranty.inspection_result || "-"} />
                            <InfoRow label="Ghi chú kiểm tra" value={warranty.inspection_note || "-"} />
                            <InfoRow label="Có đủ điều kiện bảo hành" value={warranty.is_warranty_eligible === null || warranty.is_warranty_eligible === undefined ? "-" : warranty.is_warranty_eligible ? "Có" : "Không"} />
                            <InfoRow label="Chi phí dự kiến" value={formatMoney(warranty.estimated_cost)} />
                            <InfoRow label="Hành động sửa chữa" value={warranty.repair_actions || "-"} />
                            <InfoRow label="Linh kiện thay thế" value={warranty.accessory_changed || "-"} />
                            <InfoRow label="Hãng xử lý" value={warranty.brand_name || "-"} />
                            <InfoRow label="Mã phiếu hãng" value={warranty.brand_ticket_code || "-"} />
                        </div>
                    </article>

                    <article className="rounded-xl border bg-white p-4 md:p-5">
                        <div className="flex items-center gap-2">
                            <CalendarClock className="size-5 text-blue-700" />
                            <h2 className="text-lg font-semibold">Timeline quy trình</h2>
                        </div>

                        <div className="mt-5 space-y-4">
                            {warranty.warranty_processes?.map((process, index) => (
                                <div key={process.process_id} className="relative grid gap-3 pl-8">
                                    {index < (warranty.warranty_processes?.length || 0) - 1 && (
                                        <span className="absolute left-[9px] top-6 h-full w-px bg-border" />
                                    )}
                                    <span className="absolute left-0 top-1 flex size-5 items-center justify-center rounded-full bg-blue-600 text-white">
                                        <CheckCircle2 className="size-3" />
                                    </span>

                                    <div className="rounded-lg border bg-muted/30 p-3">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="font-semibold">{getProcessTitle(process)}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {formatDateTime(process.created_at)}
                                                    {process.users?.name ? ` bởi ${process.users.name}` : ""}
                                                </p>
                                            </div>

                                            {process.new_status && (
                                                <span className="text-xs text-muted-foreground">
                                                    {getWarrantyStatusLabel(process.new_status)}
                                                </span>
                                            )}
                                        </div>

                                        {process.note && (
                                            <p className="mt-3 whitespace-pre-line text-sm">{process.note}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>

                <aside className="space-y-5">
                    <article className="rounded-xl border bg-white p-4 md:p-5">
                        <div className="flex items-center gap-2">
                            <UserRound className="size-5 text-blue-700" />
                            <h2 className="text-lg font-semibold">Phụ trách</h2>
                        </div>

                        <div className="mt-4 space-y-3 text-sm">
                            <InfoRow
                                label="Nhân viên"
                                value={warranty.users_warranties_assigned_employee_idTousers?.name || "Chưa phân công"}
                            />
                            <InfoRow label="Trạng thái hiện tại" value={getWarrantyStatusLabel(warranty.status)} />
                            <InfoRow label="Ngày tiếp nhận máy" value={formatDateTime(warranty.received_date)} />
                            <InfoRow label="Ngày dự kiến trả" value={formatDateTime(warranty.expected_return_date)} />
                            <InfoRow label="Ngày hoàn tất sửa" value={formatDateTime(warranty.completed_date)} />
                            <InfoRow label="Ngày trả máy" value={formatDateTime(warranty.returned_date)} />
                        </div>
                    </article>

                    <article className="rounded-xl border bg-white p-4 md:p-5">
                        <h2 className="text-lg font-semibold">Giao nhận</h2>
                        <div className="mt-4 space-y-3">
                            <InfoRow label="Hình thức gửi máy" value={warranty.service_method} />
                            <InfoRow label="Người gửi" value={warranty.pickup_receiver_name || "-"} />
                            <InfoRow label="Số điện thoại" value={warranty.pickup_phone || "-"} />
                            <InfoRow label="Địa chỉ lấy máy" value={warranty.pickup_address || "-"} />
                            <InfoRow label="Lịch lấy máy" value={formatDateTime(warranty.pickup_scheduled_at)} />
                            <InfoRow label="Hình thức trả máy" value={warranty.return_method || "-"} />
                            <InfoRow label="Lịch trả máy" value={formatDateTime(warranty.return_scheduled_at)} />
                            <InfoRow label="Địa chỉ trả máy" value={warranty.return_address || "-"} />
                        </div>
                    </article>
                </aside>
            </div>
        </section>
    );
}
