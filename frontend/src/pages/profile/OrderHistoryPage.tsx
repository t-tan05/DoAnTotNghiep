import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import PageLoading from "@/components/common/PageLoading";
import OrderReviewButton from "@/components/profile/OrderReviewButton";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/order.service";
import type { MyOrder, OrderDetail, OrderHistoryTab } from "@/types/order.type";
import { socket } from "@/lib/socket";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { getGhnStatusLabel } from "@/utils/orderFormat";
import { Clock3, PackageSearch, RotateCcw, Truck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type OrderTab = OrderHistoryTab;

const tabs: Array<{
    key: OrderTab;
    label: string;
}> = [
    {
        key: "payment",
        label: "Chờ thanh toán",
    },
    {
        key: "shipping",
        label: "Chờ giao hàng",
    },
    {
        key: "completed",
        label: "Đã hoàn thành",
    },
    { key: "cancelled", label: "Đã hủy" },
];

const formatPrice = (value: number | string) => {
    return Number(value).toLocaleString("vi-VN") + "đ";
};

const formatDate = (value: string) => {
    return new Date(value).toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    });
};

function getStatusLabel(order: MyOrder) {
    if(order.payment_status === "REFUND_PENDING") return "Đang xử lý hoàn tiền";
    if(order.payment_status === "REFUNDED") return "Đã hoàn tiền";
    if(order.payment_status === "REFUND_FAILED") return "Hoàn tiền cần hỗ trợ";

    const statusLabels: Record<string, string> = {
        PENDING: "Chờ xử lý",
        CONFIRMED: "Đã xác nhận",
        SHIPPED: "Đang giao",
        DELIVERY_FAILED: "Giao thất bại",
        COMPLETED: "Đã hoàn thành",
        CANCELLED: "Đã hủy",
        RETURNED: "Đã trả hàng",
    };

    return statusLabels[order.status] || order.status;
}

function getPaymentLabel(order: MyOrder) {
    const paymentLabels: Record<string, string> = {
        UNPAID: "Chưa thanh toán",
        PENDING: "Đang chờ thanh toán",
        PAID: "Đã thanh toán",
        FAILED: "Thanh toán thất bại",
        REFUND_PENDING: "Đang xử lý hoàn tiền",
        REFUNDED: "Đã hoàn tiền",
        REFUND_FAILED: "Hoàn tiền cần hỗ trợ",
    };

    return paymentLabels[order.payment_status] || order.payment_status;
}
function getVariantImage(detail: OrderDetail) {
    return (
        detail.product_variants.image_url ||
        detail.product_variants.product_images?.find((image) => image.is_default)?.image_url ||
        detail.product_variants.product_images?.[0]?.image_url ||
        ""
    );
}

function getVariantAttributes(detail: OrderDetail) {
    return detail.product_variants.variant_attribute_values
        ?.map((row) => `${row.attribute_values.product_attributes.attribute_name}: ${row.attribute_values.value}`)
        .join(" / ");
}

function getProductDetailLink(detail: OrderDetail) {
    return `/products/${detail.product_variants.products.product_id}?variantId=${detail.product_variants.variant_id}`;
}

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<MyOrder[]>([]);
    const [activeTab, setActiveTab] = useState<OrderTab>("payment");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelOrder, setCancelOrder] = useState<MyOrder | null>(null);
    const [cancellingId, setCancellingId] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [counts, setCounts] = useState<Record<OrderTab, number>>({
        payment: 0,
        shipping: 0,
        completed: 0,
        cancelled: 0,
    });

    const loadOrders = useCallback(async(nextPage = page, nextTab = activeTab) => {
        setLoading(true);
        setError("");

        try {
            const data = await orderService.getMyOrders({
                page: nextPage,
                limit: 5,
                tab: nextTab,
            });

            setOrders(data?.orders ?? []);
            setCounts(data?.counts ?? {
                payment: 0,
                shipping: 0,
                completed: 0,
                cancelled: 0,
            });

            setTotalPages(data?.meta.pagination.totalPages ?? 1);
        } catch(error) {
            setOrders([]);
            setError(getErrorMessage(error));
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [activeTab, page]);

    useEffect(() => {
        loadOrders(page, activeTab);
    }, [loadOrders, page, activeTab]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if(!token) return;

        function handleOrderUpdated() {
            loadOrders();
        }

        socket.auth = { token };
        socket.on("order:updated", handleOrderUpdated);

        if(!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off("order:updated", handleOrderUpdated);
        };
    }, [loadOrders]);

    async function handleConfirmCancelOrder() {
        if(!cancelOrder) return;

        try {
            setCancellingId(cancelOrder.order_id);

            await orderService.cancelMyOrder(cancelOrder.order_id);

            toast.success("Đã hủy đơn hàng.");
            setCancelOrder(null);
            await loadOrders();
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setCancellingId("");
        }
    }

    return (
        <section className="min-w-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Theo dõi trạng thái thanh toán, giao hàng và lịch sử mua hàng của bạn.
                    </p>
                </div>

                <div className="grid w-full grid-cols-2 overflow-hidden rounded-lg border bg-white shadow-sm sm:grid-cols-4 lg:w-auto">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setPage(1);
                                }}
                                className={[
                                    "flex h-12 min-w-0 items-center justify-center gap-2 px-3 text-sm font-medium transition cursor-pointer sm:min-w-[132px]",
                                    isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-muted-foreground hover:bg-muted",
                                ].join(" ")}
                            >
                                {tab.label}
                                {counts[tab.key] > 0 && (
                                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs text-foreground">
                                        {counts[tab.key]}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-5">
                {loading && (
                    <PageLoading text="Đang tải danh sách đơn hàng..." />
                )}

                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border bg-white p-8 text-center">
                        <div className="flex size-32 items-center justify-center rounded-full bg-muted">
                            <PackageSearch className="size-16 text-muted-foreground/60" />
                        </div>

                        <p className="mt-5 text-lg font-medium">Bạn không có đơn hàng nào</p>
                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                            Các đơn hàng thuộc trạng thái này sẽ xuất hiện tại đây sau khi bạn đặt hàng.
                        </p>

                        <Button asChild className="mt-5 h-12 cursor-pointer">
                            <Link to="/c/laptop">Tiếp tục mua hàng</Link>
                        </Button>
                    </div>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            return (
                            <article key={order.order_id} className="overflow-hidden rounded-xl border bg-white">
                                <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
                                    <div className="min-w-0">
                                        <p className="font-semibold">Đơn hàng #{order.order_id.slice(0, 8)}</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Ngày đặt: {formatDate(order.order_date)}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-sm">
                                        <span className="inline-flex h-8 items-center gap-1 rounded-full bg-blue-50 px-3 font-medium text-blue-700">
                                            <Truck className="size-4" />
                                            {getStatusLabel(order)}
                                        </span>

                                        <span className="inline-flex h-8 items-center gap-1 rounded-full bg-muted px-3 font-medium">
                                            <Clock3 className="size-4" />
                                            {getPaymentLabel(order)}
                                        </span>
                                    </div>
                                </div>

                                {(order.ghn_order_code || order.ghn_status || order.ghn_expected_delivery) && (
                                    <div className="grid gap-2 border-b bg-blue-50/60 p-4 text-sm text-blue-900 md:grid-cols-3">
                                        <div>
                                            <span className="text-blue-700">Mã vận đơn:</span>{" "}
                                            <span className="font-semibold">{order.ghn_order_code || "-"}</span>
                                        </div>
                                        <div>
                                            <span className="text-blue-700">Trạng thái GHN:</span>{" "}
                                            <span className="font-semibold">{getGhnStatusLabel(order.ghn_status)}</span>
                                        </div>
                                        <div>
                                            <span className="text-blue-700">Dự kiến giao:</span>{" "}
                                            <span className="font-semibold">
                                                {order.ghn_expected_delivery
                                                    ? formatDate(order.ghn_expected_delivery)
                                                    : "-"}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="divide-y">
                                    {order.orders_details.map((detail) => {
                                        const imageUrl = getVariantImage(detail);
                                        const attributes = getVariantAttributes(detail);
                                        const displayName = detail.product_variants.variant_name || detail.product_variants.products.product_name;
                                        const productLink = getProductDetailLink(detail);

                                        return (
                                            <div key={detail.order_detail_id} className="grid gap-4 p-4 sm:grid-cols-[88px_1fr_auto]">
                                                <Link
                                                    to={productLink}
                                                    className="overflow-hidden rounded-lg border bg-muted transition hover:border-blue-700"
                                                    aria-label={`Xem chi tiết ${displayName}`}
                                                >
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={displayName}
                                                            className="aspect-square w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex aspect-square items-center justify-center text-xs text-muted-foreground">
                                                            No image
                                                        </div>
                                                    )}
                                                </Link>

                                                <div className="min-w-0">
                                                    <h2 className="font-semibold">
                                                        <Link
                                                            to={productLink}
                                                            className="hover:text-blue-700 hover:underline"
                                                        >
                                                            {displayName}
                                                        </Link>
                                                    </h2>

                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        SKU: {detail.product_variants.sku || "-"}
                                                    </p>

                                                    {attributes && (
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {attributes}
                                                        </p>
                                                    )}

                                                    <p className="mt-2 text-sm">
                                                        Số lượng: <span className="font-medium">{detail.quantity}</span>
                                                    </p>
                                                </div>

                                                <div className="text-left font-semibold text-primary sm:text-right">
                                                    {formatPrice(detail.price)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex flex-col gap-3 border-t bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Người nhận: {order.receiver_name || "-"} | {order.receiver_phone || "-"}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
                                        {order.status === "PENDING" && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={cancellingId === order.order_id}
                                                onClick={() => setCancelOrder(order)}
                                                className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                Hủy đơn
                                            </Button>
                                        )}


                                        {order.status === "COMPLETED" && (
                                            <OrderReviewButton
                                                order={order}
                                                onReviewed={loadOrders}
                                            />
                                        )}

                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-muted-foreground">Tổng tiền</span>
                                            <span className="text-lg font-bold text-primary">
                                                {formatPrice(order.total_price)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {order.status === "CANCELLED" && order.payment_status === "FAILED" && (
                                    <div className="flex items-center gap-2 border-t bg-red-50 px-4 py-3 text-sm text-red-700">
                                        <RotateCcw className="size-4" />
                                        Đơn hàng đã bị hủy hoặc thanh toán không thành công.
                                    </div>
                                )}
                            </article>
                        )})}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-5 flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={page <= 1}
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            className="cursor-pointer disabled:cursor-not-allowed"
                        >
                            Trước
                        </Button>

                        <span className="text-sm text-muted-foreground">
                            Trang {page} / {totalPages}
                        </span>

                        <Button
                            type="button"
                            variant="outline"
                            disabled={page >= totalPages}
                            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                            className="cursor-pointer disabled:cursor-not-allowed"
                        >
                            Sau
                        </Button>
                    </div>
                )}
            </div>

            <ConfirmDeleteDialog
                open={Boolean(cancelOrder)}
                loading={cancellingId === cancelOrder?.order_id}
                title="Hủy đơn hàng"
                description={`Bạn có chắc muốn hủy đơn hàng #${cancelOrder?.order_id.slice(0, 8)} không?`}
                confirmText="Hủy đơn"
                loadingText="Đang hủy..."
                onOpenChange={(open) => {
                    if (!open) setCancelOrder(null);
                }}
                onConfirm={handleConfirmCancelOrder}
            />
        </section>
    );
}
