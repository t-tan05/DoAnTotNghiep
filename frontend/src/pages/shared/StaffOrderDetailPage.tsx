import PageLoading from "@/components/common/PageLoading";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/order.service";
import type { StaffOrder } from "@/types/order.type";
import {
    getOrderStatusLabel,
    getPaymentMethodLabel,
    getPaymentStatusLabel,
} from "@/utils/orderFormat";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

type Props = {
    basePath: string;
};

type ConfirmAction = {
    title: string;
    description: string;
    action: () => Promise<unknown>;
} | null;

export default function StaffOrderDetailPage({basePath}: Props) {
    const {orderId} = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState<StaffOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    async function loadOrder() {
        if(!orderId) return;

        try {
            setLoading(true);
            const data = await orderService.getDetailForStaff(orderId);
            setOrder(data.order);
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    async function runAction(action: () => Promise<unknown>) {
        try {
            setActionLoading(true);
            await action();
            toast.success("Cập nhật đơn hàng thành công.");
            setConfirmAction(null);
            await loadOrder();
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setActionLoading(false);
        }
    }

    if(loading) return <PageLoading text="Đang tải chi tiết đơn hàng..." />;
    if(!order) return <p>Không tìm thấy đơn hàng.</p>;

    const canConfirm = 
        order.status === "PENDING" &&
        (order.payment_method === "COD" || order.payment_status === "PAID");

    const canShip = order.status === "CONFIRMED";
    const canComplete = order.status === "SHIPPED";
    const canDeliveryFailed = order.status === "SHIPPED";
    const canCancel = !["COMPLETED", "CANCELLED", "RETURNED"].includes(order.status);

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
                            Đơn hàng #{order.order_id.slice(0, 8)}
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Ngày đặt: {new Date(order.order_date).toLocaleString("vi-VN")}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {canConfirm && (
                            <Button
                                type="button"
                                disabled={actionLoading}
                                onClick={() =>
                                    runAction(() => orderService.confirm(order.order_id))
                                }
                                className="cursor-pointer"
                            >
                                Xác nhận
                            </Button>
                        )}

                        {canShip && (
                            <Button
                                type="button"
                                disabled={actionLoading}
                                onClick={() =>
                                    runAction(() => orderService.ship(order.order_id))
                                }
                                className="cursor-pointer"
                            >
                                Giao hàng
                            </Button>
                        )}

                        {canComplete && (
                            <Button
                                type="button"
                                disabled={actionLoading}
                                onClick={() =>
                                    runAction(() => orderService.complete(order.order_id))
                                }
                                className="cursor-pointer"
                            >
                                Hoàn tất
                            </Button>
                        )}

                        {canDeliveryFailed && (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={actionLoading}
                                onClick={() =>
                                    setConfirmAction({
                                        title: "Đánh dấu giao hàng thất bại",
                                        description: "Hệ thống có thể hoàn tiền nếu đơn hàng đã thanh toán bằng VNPay. Bạn có chắc muốn tiếp tục?",
                                        action: () => orderService.markDeliveryFailed(order.order_id),
                                    })
                                }
                                className="cursor-pointer"
                            >
                                Giao thất bại
                            </Button>
                        )}

                        {canCancel && (
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={actionLoading}
                                onClick={() =>
                                    setConfirmAction({
                                        title: "Hủy đơn hàng",
                                        description: "Nếu đơn hàng đã thanh toán VNPay, hệ thống sẽ gửi yêu cầu hoàn tiền. Bạn có chắc muốn hủy đơn này?",
                                        action: () => orderService.cancelForStaff(order.order_id),
                                    })
                                }
                                className="cursor-pointer"
                            >
                                Hủy đơn
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-5">
                        <div className="rounded-lg border bg-background p-5">
                            <h2 className="text-lg font-semibold">Sản phẩm trong đơn</h2>

                            <div className="mt-4 space-y-4">
                                {order.orders_details.map((detail) => {
                                    const variant = detail.product_variants;
                                    const imageUrl = 
                                        variant.image_url ||
                                        variant.product_images?.find((image) => image.is_default)?.image_url ||
                                        variant.product_images?.[0]?.image_url;

                                    const displayName =
                                        variant.variant_name || variant.products.product_name;

                                    const attrs = variant.variant_attribute_values
                                        ?.map((item) =>
                                            `${item.attribute_values.product_attributes.attribute_name}: ${item.attribute_values.value}`
                                        )
                                        .join(" / ");
                                    
                                    return (
                                        <div 
                                            key={detail.order_detail_id}
                                            className="grid gap-4 rounded-lg border p-4 sm:grid-cols-[80px_1fr_auto]"
                                        >
                                            <div className="aspect-square overflow-hidden rounded-md border bg-muted">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={displayName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                                        No image
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="font-semibold">{displayName}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    SKU: {variant.sku || "-"}
                                                </p>
                                                {attrs && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {attrs}
                                                    </p>
                                                )}
                                                <p className="text-sm">
                                                    Số lượng: {detail.quantity}
                                                </p>
                                            </div>

                                            <div className="text-right font-semibold">
                                                {Number(detail.price).toLocaleString("vi-VN")}đ
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-lg border bg-background p-5">
                            <h2 className="text-lg font-semibold">Giao dịch thanh toán</h2>

                            <div className="mt-4 space-y-3">
                                {order.payment_transactions?.length ? (
                                    order.payment_transactions.map((transaction) => (
                                        <div 
                                            key={transaction.transaction_id}
                                            className="rounded-lg border p-4 text-sm"
                                        >
                                            <div>Mã giao dịch: {transaction.transaction_id}</div>
                                            <div>Trạng thái: {transaction.status}</div>
                                            <div>
                                                Số tiền: {Number(transaction.amount).toLocaleString("vi-VN")}đ
                                            </div>
                                            <div>
                                                Ngày tạo:{" "}
                                                {transaction.created_at
                                                    ? new Date(transaction.created_at).toLocaleString("vi-VN")
                                                    : "-"}
                                            </div>
                                        </div>
                                    ))
                                ): (
                                    <p className="text-sm text-muted-foreground">
                                        Chưa có giao dịch thanh toán.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-5">
                        <div className="rounded-lg border bg-background p-5">
                            <h2 className="text-lg font-semibold">Thông tin đơn hàng</h2>

                            

                            <div className="mt-4 space-y-2 text-sm">
                                <div>Trạng thái: {getOrderStatusLabel(order.status)}</div>
                                <div>Thanh toán: {getPaymentStatusLabel(order.payment_status)}</div>
                                <div>Phương thức: {getPaymentMethodLabel(order.payment_method)}</div>

                                <div>
                                    Nhân viên xử lý:{" "}
                                    {order.users_orders_employee_idTousers ? (
                                        <span className="font-bold">
                                            {order.users_orders_employee_idTousers.name}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">Chưa có nhân viên xử lý</span>
                                    )}
                                </div>

                                <div className="font-semibold">
                                    Tổng tiền: {Number(order.total_price).toLocaleString("vi-VN")}đ
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-background p-5">
                            <h2 className="text-lg font-semibold">Ghi chú đơn hàng</h2>

                            <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
                                {order.note?.trim() || "Khách hàng không để lại ghi chú."}
                            </p>
                        </div>

                        <div className="rounded-lg border bg-background p-5">
                            <h2 className="text-lg font-semibold">Khách hàng</h2>

                            <div className="mt-4 space-y-2 text-sm">
                                <div>{order.users_orders_user_idTousers?.name || "-"}</div>
                                <div className="text-muted-foreground">
                                    {order.users_orders_user_idTousers?.email || "-"}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-background p-5">
                            <h2 className="text-lg font-semibold">Thông tin nhận hàng</h2>

                            <div className="mt-4 space-y-2 text-sm">
                                <div>Người nhận: {order.receiver_name || "-"}</div>
                                <div>SĐT: {order.receiver_phone || "-"}</div>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            <ConfirmDeleteDialog
                open={Boolean(confirmAction)}
                loading={actionLoading}
                title={confirmAction?.title || ""}
                description={confirmAction?.description || ""}
                onOpenChange={(open) => {
                    if (!open) setConfirmAction(null);
                }}
                onConfirm={() => {
                    if (confirmAction) {
                        runAction(confirmAction.action);
                    }
                }}
            />
        </>
    )
}
