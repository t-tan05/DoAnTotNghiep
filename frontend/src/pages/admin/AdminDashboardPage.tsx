import AdminTablePagination from "@/components/admin/table/AdminTablePagination";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardSummary } from "@/types/dashboard.type";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Eye,
    PackageSearch,
    ReceiptText,
    ShieldCheck,
    Truck,
    UserPlus,
    Wallet,
    XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type NewCustomerFilter = "today" | "last7Days" | "thisMonth";

const customerFilterLabels: Record<NewCustomerFilter, string> = {
    today: "Hôm nay",
    last7Days: "7 ngày",
    thisMonth: "Tháng này",
};

function formatMoney(value: number) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function formatNumber(value: number) {
    return Number(value || 0).toLocaleString("vi-VN");
}

function MetricCard({
    label,
    value,
    sub,
    icon: Icon,
}: {
    label: string;
    value: string;
    sub?: string;
    icon: typeof Wallet;
}) {
    return (
        <div className="rounded-md border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
                    {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{text}</p>;
}

export default function AdminDashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [intervalMinutes, setIntervalMinutes] = useState(120);
    const [lowStockPage, setLowStockPage] = useState(1);
    const [customerFilter, setCustomerFilter] = useState<NewCustomerFilter>("today");

    async function loadDashboard(nextInterval = intervalMinutes, nextLowStockPage = lowStockPage) {
        try {
            const data = await dashboardService.getSummary({
                intervalMinutes: nextInterval,
                lowStockPage: nextLowStockPage,
                lowStockLimit: 5,
            });

            setSummary(data);
            setLowStockPage(data.lowStockPagination?.page ?? nextLowStockPage);
        }catch(error: any) {
            toast.error(error?.message || "Không lấy được dữ liệu dashboard.");
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard(intervalMinutes, lowStockPage);
    }, [intervalMinutes, lowStockPage]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        function handleConnect() {
            socket.emit("join_dashboard");
        }

        function handleDashboardUpdated(data: DashboardSummary) {
            setSummary(data);
            setLoading(false);
        }

        if(token) socket.auth = { token };

        socket.on("connect", handleConnect);
        socket.on("dashboard:updated", handleDashboardUpdated);

        if(!socket.connected) {
            socket.connect();
        }else {
            handleConnect();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("dashboard:updated", handleDashboardUpdated);
        };
    }, []);

    const selectedNewCustomers = summary?.cards.newCustomers?.[customerFilter] ?? 0;
    const orderRateChart = useMemo(() => {
        if(!summary) return [];

        return [
            { name: "Giao thành công", value: summary.orderRate?.completed ?? 0, color: "#16a34a" },
            { name: "Đã hủy", value: summary.orderRate?.cancelled ?? 0, color: "#dc2626" },
            { name: "Giao thất bại", value: summary.orderRate?.deliveryFailed ?? 0, color: "#f97316" },
        ].filter((item) => item.value > 0);
    }, [summary]);

    if(loading && !summary) {
        return (
            <section className="rounded-md border bg-white p-8 text-center text-muted-foreground">
                Đang tải dashboard...
            </section>
        );
    }

    if(!summary) return null;

    return (
        <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold">Tổng quan quản trị</h2>
                    <p className="text-sm text-muted-foreground">
                        Cập nhật lúc {new Date(summary.generatedAt).toLocaleTimeString("vi-VN")}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {[120, 180].map((value) => (
                        <Button
                            key={value}
                            type="button"
                            variant={intervalMinutes === value ? "default" : "outline"}
                            onClick={() => {
                                setLowStockPage(1);
                                setIntervalMinutes(value);
                            }}
                            className="cursor-pointer"
                        >
                            {value / 60} giờ
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Doanh thu hôm nay" value={formatMoney(summary.cards.todayRevenue)} sub={`${summary.cards.completedOrdersToday} đơn hoàn thành`} icon={Wallet} />
                <MetricCard label="Đơn hàng mới hôm nay" value={formatNumber(summary.cards.ordersToday)} sub="Tính theo ngày tạo đơn" icon={ReceiptText} />
                <MetricCard label="Đơn hoàn thành hôm nay" value={formatNumber(summary.cards.completedOrdersToday)} sub="Tính theo thời điểm hoàn thành" icon={CheckCircle2} />
                <MetricCard label="Đơn giao thất bại hôm nay" value={formatNumber(summary.cards.deliveryFailedToday ?? 0)} sub="Tính theo thời điểm thất bại" icon={Truck} />
                <MetricCard label="Đơn đang chờ xử lý" value={formatNumber(summary.cards.pendingOrders ?? 0)} sub="Tất cả đơn PENDING" icon={Clock} />
                <MetricCard label="Đơn đã hủy" value={formatNumber(summary.cards.cancelledOrders ?? 0)} sub={`${summary.cards.cancelledOrdersToday ?? 0} đơn hủy hôm nay`} icon={XCircle} />
                <MetricCard label="Sản phẩm sắp hết hàng" value={formatNumber(summary.cards.lowStockCount)} sub="Ngưỡng cảnh báo 5 sản phẩm" icon={PackageSearch} />
                <MetricCard label="Yêu cầu bảo hành hôm nay" value={formatNumber(summary.cards.warrantyRequestsToday ?? 0)} sub="Tính theo ngày tạo phiếu" icon={ShieldCheck} />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                <div className="space-y-3 rounded-md border bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="font-semibold">Doanh thu theo thời gian</h3>
                            <p className="text-sm text-muted-foreground">Biểu đồ cột theo mỗi {summary.intervalMinutes / 60} giờ</p>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary.revenueChart}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(value) => `${Number(value) / 1000000}tr`} tick={{ fontSize: 12 }} width={56} />
                                <Tooltip formatter={(value) => formatMoney(Number(value))} />
                                <Bar dataKey="revenue" name="Doanh thu" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="rounded-md border bg-white p-4">
                        <div className="mb-4 flex items-center gap-2">
                            <Eye className="size-5 text-blue-700" />
                            <h3 className="font-semibold">Lưu lượng truy cập</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="rounded-md bg-muted p-3">
                                <p className="text-xs text-muted-foreground">Vãng lai</p>
                                <p className="text-xl font-bold">{formatNumber(summary.traffic.online.guest)}</p>
                            </div>
                            <div className="rounded-md bg-muted p-3">
                                <p className="text-xs text-muted-foreground">Đã đăng nhập</p>
                                <p className="text-xl font-bold">{formatNumber(summary.traffic.online.authenticated)}</p>
                            </div>
                            <div className="rounded-md bg-muted p-3">
                                <p className="text-xs text-muted-foreground">Nhân viên</p>
                                <p className="text-xl font-bold">{formatNumber(summary.activeStaff.employees)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-md border bg-white p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <UserPlus className="size-5 text-blue-700" />
                                <h3 className="font-semibold">Khách hàng mới</h3>
                            </div>
                        </div>
                        <div className="mb-4 flex flex-wrap gap-2">
                            {(Object.keys(customerFilterLabels) as NewCustomerFilter[]).map((value) => (
                                <Button
                                    key={value}
                                    type="button"
                                    size="sm"
                                    variant={customerFilter === value ? "default" : "outline"}
                                    onClick={() => setCustomerFilter(value)}
                                >
                                    {customerFilterLabels[value]}
                                </Button>
                            ))}
                        </div>
                        <p className="text-3xl font-bold">{formatNumber(selectedNewCustomers)}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{customerFilterLabels[customerFilter]}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
                <div className="rounded-md border bg-white p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <AlertTriangle className="size-5 text-orange-600" />
                        <h3 className="font-semibold">Tỷ lệ trạng thái hôm nay</h3>
                    </div>
                    {orderRateChart.length ? (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={orderRateChart} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} label>
                                        {orderRateChart.map((item) => (
                                            <Cell key={item.name} fill={item.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${formatNumber(Number(value))} đơn`, name]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState text="Chưa có dữ liệu trạng thái hôm nay." />
                    )}
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="rounded-md bg-emerald-50 p-2 text-emerald-700">{summary.orderRate?.successRate ?? 0}% thành công</div>
                        <div className="rounded-md bg-red-50 p-2 text-red-700">{summary.orderRate?.cancelRate ?? 0}% hủy</div>
                        <div className="rounded-md bg-orange-50 p-2 text-orange-700">{summary.orderRate?.deliveryFailedRate ?? 0}% thất bại</div>
                    </div>
                </div>

                <div className="rounded-md border bg-white p-4">
                    <h3 className="mb-4 font-semibold">Sản phẩm bán chạy hôm nay</h3>
                    <div className="space-y-3">
                        {summary.bestSellers.length ? summary.bestSellers.map((item, index) => (
                            <div key={item.variantId} className="flex items-center gap-3 rounded-md border p-3">
                                <div className="flex size-8 items-center justify-center rounded-md bg-blue-50 text-sm font-bold text-blue-700">{index + 1}</div>
                                <div className="flex size-14 shrink-0 items-center justify-center bg-muted">
                                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" /> : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-1 font-medium">{item.productName || item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.sold} sản phẩm · {formatMoney(item.revenue)}</p>
                                </div>
                            </div>
                        )) : <EmptyState text="Chưa có sản phẩm bán chạy hôm nay." />}
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-white p-4">
                <div className="mb-4 flex items-center gap-2">
                    <PackageSearch className="size-5 text-blue-700" />
                    <h3 className="font-semibold">Sản phẩm sắp hết hàng</h3>
                </div>
                <div className="space-y-3">
                    {summary.lowStock.length ? summary.lowStock.map((item) => (
                        <div key={item.variantId} className="flex items-center gap-3 rounded-md border p-3">
                            <div className="flex size-14 shrink-0 items-center justify-center bg-muted">
                                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" /> : null}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-1 font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">SKU: {item.sku || "N/A"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-red-600">{item.available}</p>
                                <p className="text-xs text-muted-foreground">có thể bán</p>
                            </div>
                        </div>
                    )) : <EmptyState text="Không có sản phẩm sắp hết hàng." />}
                </div>
                <AdminTablePagination
                    page={summary.lowStockPagination?.page ?? lowStockPage}
                    totalPages={summary.lowStockPagination?.totalPages ?? 1}
                    onPageChange={setLowStockPage}
                />
            </div>
        </section>
    );
}
