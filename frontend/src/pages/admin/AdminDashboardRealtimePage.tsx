import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardSummary } from "@/types/dashboard.type";
import { Activity, Boxes, Eye, PackageSearch, ReceiptText, UsersRound, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
                    {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
                </div>
                <div className="flex size-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}

function RevenueLineChart({ data }: { data: DashboardSummary["revenueChart"] }) {
    const width = 900;
    const height = 260;
    const padding = 28;
    const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);
    const points = data.map((item, index) => {
        const x = data.length === 1 ? width / 2 : padding + index * ((width - padding * 2) / (data.length - 1));
        const y = height - padding - (item.revenue / maxRevenue) * (height - padding * 2);

        return { ...item, x, y };
    });
    const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");

    return (
        <div className="overflow-hidden rounded-md border bg-white">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d7dde8" />
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d7dde8" />
                <polyline points={polyline} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((point) => (
                    <g key={point.label}>
                        <circle cx={point.x} cy={point.y} r="5" fill="#2563eb" />
                        <text x={point.x} y={height - 8} textAnchor="middle" className="fill-slate-500 text-[11px]">
                            {point.label}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}

export default function AdminDashboardRealtimePage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [intervalMinutes, setIntervalMinutes] = useState(60);

    async function loadDashboard(nextInterval = intervalMinutes) {
        try {
            const data = await dashboardService.getSummary({
                intervalMinutes: nextInterval,
            });

            setSummary(data);
        }catch(error: any) {
            toast.error(error?.message || "Không lấy được dữ liệu dashboard.");
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard(intervalMinutes);
    }, [intervalMinutes]);

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

    const maxChartRevenue = useMemo(() => {
        return Math.max(...(summary?.revenueChart ?? []).map((item) => item.revenue), 0);
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
                    <h2 className="text-2xl font-bold">Tổng quan realtime</h2>
                    <p className="text-sm text-muted-foreground">
                        Cập nhật lúc {new Date(summary.generatedAt).toLocaleTimeString("vi-VN")}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {[30, 60, 120].map((value) => (
                        <Button
                            key={value}
                            type="button"
                            variant={intervalMinutes === value ? "default" : "outline"}
                            onClick={() => setIntervalMinutes(value)}
                            className="cursor-pointer"
                        >
                            {value} phút
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Doanh thu hôm nay" value={formatMoney(summary.cards.todayRevenue)} sub={`${summary.cards.completedOrdersToday} đơn hoàn tất`} icon={Wallet} />
                <MetricCard label="Đơn hàng hôm nay" value={formatNumber(summary.cards.ordersToday)} sub="Tất cả trạng thái" icon={ReceiptText} />
                <MetricCard label="Tồn kho thấp" value={formatNumber(summary.cards.lowStockCount)} sub="Ngưỡng cảnh báo 5 sản phẩm" icon={Boxes} />
                <MetricCard label="Nhân viên hoạt động" value={formatNumber(summary.activeStaff.employees)} sub={`${summary.activeStaff.admins} admin online`} icon={UsersRound} />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                <div className="space-y-3 rounded-md border bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="font-semibold">Doanh thu theo thời gian</h3>
                            <p className="text-sm text-muted-foreground">Mỗi điểm tương ứng {summary.intervalMinutes} phút</p>
                        </div>
                        <div className="text-sm font-semibold text-blue-700">Đỉnh: {formatMoney(maxChartRevenue)}</div>
                    </div>
                    <RevenueLineChart data={summary.revenueChart} />
                </div>

                <div className="space-y-4">
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
                        <div className="hidden">
                            {summary.traffic.topPagesToday.map((page) => (
                                <div key={page.path} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="truncate text-muted-foreground">{page.path}</span>
                                    <span className="font-semibold">{formatNumber(page.views)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hidden">
                        <div className="mb-4 flex items-center gap-2">
                            <Activity className="size-5 text-blue-700" />
                            <h3 className="font-semibold">Trạng thái realtime</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Khách online</span>
                                <strong>{formatNumber(summary.traffic.online.total)}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Staff online</span>
                                <strong>{formatNumber(summary.activeStaff.total)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
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
                                    <p className="line-clamp-1 font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.sold} sản phẩm · {formatMoney(item.revenue)}</p>
                                </div>
                            </div>
                        )) : <p className="text-sm text-muted-foreground">Chưa có sản phẩm bán chạy hôm nay.</p>}
                    </div>
                </div>

                <div className="rounded-md border bg-white p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <PackageSearch className="size-5 text-blue-700" />
                        <h3 className="font-semibold">Tồn kho thấp</h3>
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
                        )) : <p className="text-sm text-muted-foreground">Không có sản phẩm tồn kho thấp.</p>}
                    </div>
                </div>
            </div>
        </section>
    );
}
