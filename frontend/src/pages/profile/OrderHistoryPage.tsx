import PageLoading from "@/components/common/PageLoading";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/order.service";
import type { MyOrder, OrderDetail } from "@/types/order.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Clock3, PackageSearch, RotateCcw, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type OrderTab = "payment" | "shipping" | "completed";

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

function getOrderTab(order: MyOrder): OrderTab {
    if(order.status === "COMPLETED") return "completed";

    if(
        order.status === "PENDING"
        && ["UNPAID", "PENDING", "FAILED"].includes(order.payment_status)
    ) {
        return "payment";
    }

    return "shipping";
}

function getStatusLabel(order: MyOrder) {
    if(order.payment_status === "REFUNDED") return "Đã hoàn tiền";

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
        REFUNDED: "Đã hoàn tiền",
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

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<MyOrder[]>([]);
    const [activeTab, setActiveTab] = useState<OrderTab>("payment");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadOrders() {
        setLoading(true);
        setError("");

        try {
            const data = await orderService.getMyOrders();
            setOrders(data?.orders ?? []);
        } catch(error) {
            setOrders([]);
            setError(getErrorMessage(error));
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => getOrderTab(order) === activeTab);
    }, [activeTab, orders]);

    const counts = useMemo(() => {
        return tabs.reduce<Record<OrderTab, number>>((acc, tab) => {
            acc[tab.key] = orders.filter((order) => getOrderTab(order) === tab.key).length;
            return acc;
        }, {
            payment: 0,
            shipping: 0,
            completed: 0,
        });
    }, [orders]);

    return (
        <section className="min-w-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Theo dõi trạng thái thanh toán, giao hàng và lịch sử mua hàng của bạn.
                    </p>
                </div>

                <div className="flex overflow-hidden rounded-lg border bg-white shadow-sm">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={[
                                    "h-12 min-w-[142px] px-4 text-sm font-medium transition cursor-pointer",
                                    isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-muted-foreground hover:bg-muted",
                                ].join(" ")}
                            >
                                {tab.label}
                                {counts[tab.key] > 0 && (
                                    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
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

                {!loading && !error && filteredOrders.length === 0 && (
                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border bg-white p-8 text-center">
                        <div className="flex size-32 items-center justify-center rounded-full bg-muted">
                            <PackageSearch className="size-16 text-muted-foreground/60" />
                        </div>

                        <p className="mt-5 text-lg font-medium">Bạn không có đơn hàng nào</p>
                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                            Các đơn hàng thuộc trạng thái này sẽ xuất hiện tại đây sau khi bạn đặt hàng.
                        </p>

                        <Button asChild className="mt-5 h-12 cursor-pointer">
                            <Link to="/products">Tiếp tục mua hàng</Link>
                        </Button>
                    </div>
                )}

                {!loading && !error && filteredOrders.length > 0 && (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
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

                                <div className="divide-y">
                                    {order.orders_details.map((detail) => {
                                        const imageUrl = getVariantImage(detail);
                                        const attributes = getVariantAttributes(detail);
                                        const displayName = detail.product_variants.variant_name || detail.product_variants.products.product_name;

                                        return (
                                            <div key={detail.order_detail_id} className="grid gap-4 p-4 sm:grid-cols-[88px_1fr_auto]">
                                                <div className="overflow-hidden rounded-lg border bg-muted">
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
                                                </div>

                                                <div className="min-w-0">
                                                    <h2 className="font-semibold">
                                                        {displayName}
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

                                    <div className="flex items-center justify-between gap-4 md:justify-end">
                                        <span className="text-sm text-muted-foreground">Tổng tiền</span>
                                        <span className="text-lg font-bold text-primary">
                                            {formatPrice(order.total_price)}
                                        </span>
                                    </div>
                                </div>

                                {order.status === "CANCELLED" && order.payment_status === "FAILED" && (
                                    <div className="flex items-center gap-2 border-t bg-red-50 px-4 py-3 text-sm text-red-700">
                                        <RotateCcw className="size-4" />
                                        Đơn hàng đã bị hủy hoặc thanh toán không thành công.
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
