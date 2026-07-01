import PageLoading from "@/components/common/PageLoading";
import WarrantyStatusBadge, { getWarrantyStatusLabel } from "@/components/profile/WarrantyStatusBadge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { socket } from "@/lib/socket";
import { warrantyService } from "@/services/warranty.service";
import type {
    Warranty,
    WarrantyProcess,
    WarrantyServiceMethod,
} from "@/types/warranty.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ArrowLeft, CheckCircle2, ClipboardList, Package, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

type Props = {
    basePath: string;
    canManage?: boolean;
};

type ActionType =
    | "approve"
    | "reject"
    | "customer-drop-off"
    | "schedule-pickup"
    | "picked-up"
    | "receive"
    | "inspect"
    | "start-repair"
    | "send-to-brand"
    | "brand-returned"
    | "complete"
    | "schedule-return"
    | "return"
    | "cancel";

type ActionDialogState = {
    type: ActionType;
    title: string;
    description: string;
};

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
            <div className="mt-1 whitespace-pre-line text-sm font-medium">{value || "-"}</div>
        </div>
    );
}

export default function StaffWarrantyDetailPage({basePath, canManage = false}: Props) {
    const { warrantyId } = useParams();
    const navigate = useNavigate();

    const [warranty, setWarranty] = useState<Warranty | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionDialog, setActionDialog] = useState<ActionDialogState | null>(null);

    const [note, setNote] = useState("");
    const [pickupReceiverName, setPickupReceiverName] = useState("");
    const [pickupPhone, setPickupPhone] = useState("");
    const [pickupAddress, setPickupAddress] = useState("");
    const [pickupScheduledAt, setPickupScheduledAt] = useState("");
    const [inspectionResult, setInspectionResult] = useState("");
    const [inspectionNote, setInspectionNote] = useState("");
    const [isWarrantyEligible, setIsWarrantyEligible] = useState(true);
    const [estimatedCost, setEstimatedCost] = useState("");
    const [expectedReturnDate, setExpectedReturnDate] = useState("");
    const [repairActions, setRepairActions] = useState("");
    const [accessoryChanged, setAccessoryChanged] = useState("");
    const [brandName, setBrandName] = useState("");
    const [brandTicketCode, setBrandTicketCode] = useState("");
    const [returnMethod, setReturnMethod] = useState<WarrantyServiceMethod>("PICKUP");
    const [returnReceiverName, setReturnReceiverName] = useState("");
    const [returnPhone, setReturnPhone] = useState("");
    const [returnAddress, setReturnAddress] = useState("");
    const [returnScheduledAt, setReturnScheduledAt] = useState("");

    const loadWarranty = useCallback(async() => {
        if(!warrantyId) return;

        try {
            setLoading(true);
            const data = await warrantyService.getDetailForStaff(warrantyId);
            setWarranty(data.warranty);
        } catch(error) {
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
        socket.on("warranty:updated", handleWarrantyChanged);
        socket.on("warranty:process_added", handleWarrantyChanged);

        if(!socket.connected) {
            socket.connect();
        } else {
            socket.emit("join_warranty_detail", warrantyId);
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("warranty:updated", handleWarrantyChanged);
            socket.off("warranty:process_added", handleWarrantyChanged);
        };
    }, [loadWarranty, warrantyId]);

    function resetForm() {
        setNote("");
        setPickupReceiverName(warranty?.pickup_receiver_name || warranty?.users?.name || "");
        setPickupPhone(warranty?.pickup_phone || "");
        setPickupAddress(warranty?.pickup_address || "");
        setPickupScheduledAt("");
        setInspectionResult("");
        setInspectionNote("");
        setIsWarrantyEligible(true);
        setEstimatedCost("");
        setExpectedReturnDate("");
        setRepairActions("");
        setAccessoryChanged("");
        setBrandName(warranty?.devices.product_variants.products.brands?.brand_name || "");
        setBrandTicketCode("");
        setReturnMethod(warranty?.service_method || "PICKUP");
        setReturnReceiverName(warranty?.pickup_receiver_name || warranty?.users?.name || "");
        setReturnPhone(warranty?.pickup_phone || "");
        setReturnAddress(warranty?.pickup_address || "");
        setReturnScheduledAt("");
    }

    function openAction(type: ActionType, title: string, description: string) {
        resetForm();
        setActionDialog({ type, title, description });
    }

    const actions = useMemo(() => {
        if(!warranty || !canManage) return [];

        const result: Array<{type: ActionType; label: string; variant?: "default" | "outline" | "destructive"; description: string}> = [];

        if(warranty.status === "REQUESTED") {
            result.push({ type: "approve", label: "Duyệt yêu cầu", description: "Xác nhận yêu cầu hợp lệ và chuyển sang bước hẹn nhận máy." });
            result.push({ type: "reject", label: "Từ chối", variant: "outline", description: "Từ chối yêu cầu nếu serial/hình ảnh/thông tin không phù hợp." });
        }

        if(["REQUESTED", "APPROVED"].includes(warranty.status)) {
            result.push({ type: "customer-drop-off", label: "Khách mang tới", variant: "outline", description: "Ghi nhận khách sẽ mang máy trực tiếp tới cửa hàng." });
            result.push({ type: "schedule-pickup", label: "Hẹn lấy máy", description: "Nhập lịch và địa chỉ lấy máy từ khách." });
        }

        if(warranty.status === "PICKUP_SCHEDULED") {
            result.push({ type: "picked-up", label: "Đã lấy máy", description: "Xác nhận nhân viên/shipper đã lấy máy từ khách." });
        }

        if(["PICKED_UP", "CUSTOMER_DROP_OFF"].includes(warranty.status)) {
            result.push({ type: "receive", label: "Tiếp nhận máy", description: "Xác nhận cửa hàng đã nhận máy và bắt đầu kiểm tra." });
        }

        if(warranty.status === "RECEIVED") {
            result.push({ type: "inspect", label: "Cập nhật kiểm tra", description: "Ghi kết quả kiểm tra ngoại quan, lỗi và điều kiện bảo hành." });
        }

        if(["INSPECTING", "WAITING_CUSTOMER_CONFIRMATION"].includes(warranty.status)) {
            result.push({ type: "start-repair", label: "Bắt đầu sửa", description: "Chuyển sang xử lý nội bộ và ghi dự kiến trả máy." });
            result.push({ type: "send-to-brand", label: "Gửi hãng", variant: "outline", description: "Chuyển máy sang hãng/trung tâm ủy quyền." });
        }

        if(warranty.status === "SENT_TO_BRAND") {
            result.push({ type: "brand-returned", label: "Hãng trả máy", description: "Xác nhận hãng đã trả máy về cửa hàng." });
        }

        if(["IN_PROGRESS", "BRAND_RETURNED"].includes(warranty.status)) {
            result.push({ type: "complete", label: "Hoàn tất sửa", description: "Ghi nhận xử lý xong và chuẩn bị trả máy." });
        }

        if(warranty.status === "COMPLETED") {
            result.push({ type: "schedule-return", label: "Hẹn trả máy", description: "Lên lịch trả máy cho khách." });
        }

        if(warranty.status === "RETURN_SCHEDULED") {
            result.push({ type: "return", label: "Đã trả máy", description: "Xác nhận khách đã nhận lại thiết bị." });
        }

        if(!["REJECTED", "RETURNED", "CANCELLED"].includes(warranty.status)) {
            result.push({ type: "cancel", label: "Hủy phiếu", variant: "destructive", description: "Hủy phiếu bảo hành khi khách rút yêu cầu hoặc quy trình không thể tiếp tục." });
        }

        return result;
    }, [canManage, warranty]);

    async function handleSubmitAction(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if(!warranty || !actionDialog) return;

        try {
            setActionLoading(true);
            const warrantyId = warranty.warranty_id;
            const currentNote = note.trim() || undefined;

            if(actionDialog.type === "approve") await warrantyService.approve(warrantyId, { note: currentNote });
            if(actionDialog.type === "reject") await warrantyService.reject(warrantyId, { note: currentNote });
            if(actionDialog.type === "customer-drop-off") await warrantyService.customerDropOff(warrantyId, { note: currentNote });
            if(actionDialog.type === "picked-up") await warrantyService.pickedUp(warrantyId, { note: currentNote });
            if(actionDialog.type === "receive") await warrantyService.receive(warrantyId, { note: currentNote });
            if(actionDialog.type === "brand-returned") await warrantyService.brandReturned(warrantyId, { note: currentNote });
            if(actionDialog.type === "return") await warrantyService.returnToCustomer(warrantyId, { note: currentNote });
            if(actionDialog.type === "cancel") await warrantyService.cancel(warrantyId, { note: currentNote });

            if(actionDialog.type === "schedule-pickup") {
                await warrantyService.schedulePickup(warrantyId, {
                    pickupReceiverName,
                    pickupPhone,
                    pickupAddress,
                    pickupScheduledAt: new Date(pickupScheduledAt).toISOString(),
                    note: currentNote,
                });
            }

            if(actionDialog.type === "inspect") {
                await warrantyService.inspect(warrantyId, {
                    inspectionResult,
                    inspectionNote: inspectionNote.trim() || undefined,
                    isWarrantyEligible,
                    estimatedCost: estimatedCost ? Number(estimatedCost) : null,
                    note: currentNote,
                });
            }

            if(actionDialog.type === "start-repair") {
                await warrantyService.startRepair(warrantyId, {
                    expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate).toISOString() : undefined,
                    repairActions: repairActions.trim() || undefined,
                    accessoryChanged: accessoryChanged.trim() || undefined,
                    note: currentNote,
                });
            }

            if(actionDialog.type === "send-to-brand") {
                await warrantyService.sendToBrand(warrantyId, {
                    brandName,
                    brandTicketCode: brandTicketCode.trim() || undefined,
                    note: currentNote,
                });
            }

            if(actionDialog.type === "complete") {
                await warrantyService.complete(warrantyId, {
                    expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate).toISOString() : undefined,
                    repairActions: repairActions.trim() || undefined,
                    accessoryChanged: accessoryChanged.trim() || undefined,
                    note: currentNote,
                });
            }

            if(actionDialog.type === "schedule-return") {
                await warrantyService.scheduleReturn(warrantyId, {
                    returnMethod,
                    returnReceiverName: returnReceiverName.trim() || undefined,
                    returnPhone: returnPhone.trim() || undefined,
                    returnAddress: returnAddress.trim() || undefined,
                    returnScheduledAt: returnScheduledAt ? new Date(returnScheduledAt).toISOString() : undefined,
                    note: currentNote,
                });
            }

            toast.success("Cập nhật bảo hành thành công.");
            setActionDialog(null);
            await loadWarranty();
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setActionLoading(false);
        }
    }

    if(loading) return <PageLoading text="Đang tải chi tiết bảo hành..." />;
    if(!warranty) return <p>Không tìm thấy phiếu bảo hành.</p>;

    const variant = warranty.devices.product_variants;
    const productName = variant.variant_name || variant.products.product_name;
    const imageUrl = getWarrantyImage(warranty);

    return (
        <>
            <section className="space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate(basePath)}
                            className="mb-2 cursor-pointer px-0"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Phiếu bảo hành #{warranty.warranty_code}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Tạo lúc: {formatDateTime(warranty.created_at)}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <WarrantyStatusBadge status={warranty.status} />
                        {actions.map((action) => (
                            <Button
                                key={action.type}
                                type="button"
                                variant={action.variant || "default"}
                                disabled={actionLoading}
                                onClick={() => openAction(action.type, action.label, action.description)}
                                className="cursor-pointer"
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-5">
                        <article className="rounded-lg border bg-background p-5">
                            <div className="flex items-center gap-2">
                                <Package className="size-5 text-blue-700" />
                                <h2 className="text-lg font-semibold">Thiết bị</h2>
                            </div>

                            <div className="mt-4 grid gap-4 sm:grid-cols-[96px_1fr]">
                                <Link to={getProductDetailLink(warranty)} className="overflow-hidden rounded-md border bg-muted transition hover:border-blue-700">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt={productName} className="aspect-square w-full object-cover" />
                                    ) : (
                                        <div className="flex aspect-square items-center justify-center text-xs text-muted-foreground">No image</div>
                                    )}
                                </Link>

                                <div>
                                    <h3 className="font-semibold">
                                        <Link to={getProductDetailLink(warranty)} className="hover:text-blue-700 hover:underline">
                                            {productName}
                                        </Link>
                                    </h3>
                                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                                        <InfoRow label="SKU" value={variant.sku || "-"} />
                                        <InfoRow label="Serial" value={warranty.devices.serial_number} />
                                        <InfoRow label="Ngày bán" value={formatDateTime(warranty.devices.sold_date)} />
                                        <InfoRow label="Hạn bảo hành" value={formatDateTime(warranty.devices.warranty_end_date)} />
                                    </div>
                                </div>
                            </div>
                        </article>

                        <article className="rounded-lg border bg-background p-5">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="size-5 text-blue-700" />
                                <h2 className="text-lg font-semibold">Thông tin xử lý</h2>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <InfoRow label="Mô tả lỗi" value={warranty.issue_description} />
                                <InfoRow label="Ghi chú khách" value={warranty.note || "-"} />
                                <InfoRow label="Kết quả kiểm tra" value={warranty.inspection_result || "-"} />
                                <InfoRow label="Ghi chú kiểm tra" value={warranty.inspection_note || "-"} />
                                <InfoRow label="Đủ điều kiện bảo hành" value={warranty.is_warranty_eligible === undefined || warranty.is_warranty_eligible === null ? "-" : warranty.is_warranty_eligible ? "Có" : "Không"} />
                                <InfoRow label="Chi phí dự kiến" value={formatMoney(warranty.estimated_cost)} />
                                <InfoRow label="Hành động sửa chữa" value={warranty.repair_actions || "-"} />
                                <InfoRow label="Linh kiện thay thế" value={warranty.accessory_changed || "-"} />
                                <InfoRow label="Hãng xử lý" value={warranty.brand_name || "-"} />
                                <InfoRow label="Mã phiếu hãng" value={warranty.brand_ticket_code || "-"} />
                            </div>
                        </article>

                        <article className="rounded-lg border bg-background p-5">
                            <h2 className="text-lg font-semibold">Timeline quy trình</h2>
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
                                            {process.note && <p className="mt-3 whitespace-pre-line text-sm">{process.note}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </div>

                    <aside className="space-y-5">
                        <article className="rounded-lg border bg-background p-5">
                            <div className="flex items-center gap-2">
                                <UserRound className="size-5 text-blue-700" />
                                <h2 className="text-lg font-semibold">Khách hàng</h2>
                            </div>
                            <div className="mt-4 space-y-3">
                                <InfoRow label="Tên" value={warranty.users?.name || "-"} />
                                <InfoRow label="Email" value={warranty.users?.email || "-"} />
                                <InfoRow label="Nhân viên phụ trách" value={warranty.users_warranties_assigned_employee_idTousers?.name || "Chưa phân công"} />
                            </div>
                        </article>

                        <article className="rounded-lg border bg-background p-5">
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

            <Dialog open={Boolean(actionDialog)} onOpenChange={(open) => !open && setActionDialog(null)}>
                <DialogContent className="sm:max-w-xl">
                    <form onSubmit={handleSubmitAction} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>{actionDialog?.title}</DialogTitle>
                            <DialogDescription>{actionDialog?.description}</DialogDescription>
                        </DialogHeader>

                        {actionDialog?.type === "schedule-pickup" && (
                            <div className="grid gap-3">
                                <div>
                                    <Label>Người gửi máy</Label>
                                    <Input value={pickupReceiverName} onChange={(event) => setPickupReceiverName(event.target.value)} required />
                                </div>
                                <div>
                                    <Label>Số điện thoại</Label>
                                    <Input value={pickupPhone} onChange={(event) => setPickupPhone(event.target.value)} required />
                                </div>
                                <div>
                                    <Label>Địa chỉ lấy máy</Label>
                                    <Textarea value={pickupAddress} onChange={(event) => setPickupAddress(event.target.value)} required />
                                </div>
                                <div>
                                    <Label>Thời gian lấy máy</Label>
                                    <Input type="datetime-local" value={pickupScheduledAt} onChange={(event) => setPickupScheduledAt(event.target.value)} required />
                                </div>
                            </div>
                        )}

                        {actionDialog?.type === "inspect" && (
                            <div className="grid gap-3">
                                <div>
                                    <Label>Kết quả kiểm tra</Label>
                                    <Textarea value={inspectionResult} onChange={(event) => setInspectionResult(event.target.value)} required />
                                </div>
                                <div>
                                    <Label>Ghi chú kiểm tra</Label>
                                    <Textarea value={inspectionNote} onChange={(event) => setInspectionNote(event.target.value)} />
                                </div>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={isWarrantyEligible} onChange={(event) => setIsWarrantyEligible(event.target.checked)} />
                                    Đủ điều kiện bảo hành miễn phí
                                </label>
                                <div>
                                    <Label>Chi phí dự kiến nếu không bảo hành miễn phí</Label>
                                    <Input type="number" min={0} value={estimatedCost} onChange={(event) => setEstimatedCost(event.target.value)} />
                                </div>
                            </div>
                        )}

                        {["start-repair", "complete"].includes(actionDialog?.type || "") && (
                            <div className="grid gap-3">
                                <div>
                                    <Label>Ngày dự kiến trả máy</Label>
                                    <Input type="datetime-local" value={expectedReturnDate} onChange={(event) => setExpectedReturnDate(event.target.value)} />
                                </div>
                                <div>
                                    <Label>Hành động sửa chữa</Label>
                                    <Textarea value={repairActions} onChange={(event) => setRepairActions(event.target.value)} />
                                </div>
                                <div>
                                    <Label>Linh kiện thay thế</Label>
                                    <Textarea value={accessoryChanged} onChange={(event) => setAccessoryChanged(event.target.value)} />
                                </div>
                            </div>
                        )}

                        {actionDialog?.type === "send-to-brand" && (
                            <div className="grid gap-3">
                                <div>
                                    <Label>Hãng/trung tâm xử lý</Label>
                                    <Input value={brandName} onChange={(event) => setBrandName(event.target.value)} required />
                                </div>
                                <div>
                                    <Label>Mã phiếu của hãng</Label>
                                    <Input value={brandTicketCode} onChange={(event) => setBrandTicketCode(event.target.value)} />
                                </div>
                            </div>
                        )}

                        {actionDialog?.type === "schedule-return" && (
                            <div className="grid gap-3">
                                <div>
                                    <Label>Hình thức trả máy</Label>
                                    <select value={returnMethod} onChange={(event) => setReturnMethod(event.target.value as WarrantyServiceMethod)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                                        <option value="PICKUP">Giao/lấy tận nơi</option>
                                        <option value="DROP_OFF">Khách nhận tại cửa hàng</option>
                                        <option value="SHIPPING">Gửi đơn vị vận chuyển</option>
                                    </select>
                                </div>
                                <div>
                                    <Label>Người nhận</Label>
                                    <Input value={returnReceiverName} onChange={(event) => setReturnReceiverName(event.target.value)} />
                                </div>
                                <div>
                                    <Label>Số điện thoại</Label>
                                    <Input value={returnPhone} onChange={(event) => setReturnPhone(event.target.value)} />
                                </div>
                                <div>
                                    <Label>Địa chỉ trả máy</Label>
                                    <Textarea value={returnAddress} onChange={(event) => setReturnAddress(event.target.value)} />
                                </div>
                                <div>
                                    <Label>Thời gian trả máy</Label>
                                    <Input type="datetime-local" value={returnScheduledAt} onChange={(event) => setReturnScheduledAt(event.target.value)} />
                                </div>
                            </div>
                        )}

                        <div>
                            <Label>Ghi chú</Label>
                            <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Nhập ghi chú cho bước xử lý này" />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setActionDialog(null)} disabled={actionLoading}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={actionLoading} className="cursor-pointer">
                                {actionLoading ? "Đang cập nhật..." : "Xác nhận"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
