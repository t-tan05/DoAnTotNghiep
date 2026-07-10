import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { dashboardService } from "@/services/dashboard.service";
import type { AdminStatistics, DashboardProductStat, StatisticsFilterPreset } from "@/types/dashboard.type";
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
    ChartColumn,
    PackageCheck,
    ReceiptText,
    ShieldCheck,
    ShoppingCart,
    UserPlus,
    Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const filterLabels: Record<StatisticsFilterPreset, string> = {
    today: "Hôm nay",
    last7days: "7 ngày gần nhất",
    thisMonth: "Tháng này",
    lastMonth: "Tháng trước",
    thisYear: "Năm nay",
    custom: "Tùy chọn",
};

function formatMoney(value: number) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function formatNumber(value: number) {
    return Number(value || 0).toLocaleString("vi-VN");
}

function StatCard({
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
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}

function ProductList({
    title,
    products,
    valueText,
}: {
    title: string;
    products: DashboardProductStat[];
    valueText: (item: DashboardProductStat) => string;
}) {
    return (
        <div className="rounded-md border bg-white p-4">
            <h3 className="mb-4 font-semibold">{title}</h3>
            <div className="space-y-3">
                {products.length ? products.map((item, index) => (
                    <div key={`${item.productId || item.variantId}-${index}`} className="flex items-center gap-3 rounded-md border p-3">
                        <div className="flex size-8 items-center justify-center rounded-md bg-blue-50 text-sm font-bold text-blue-700">{index + 1}</div>
                        <div className="flex size-14 shrink-0 items-center justify-center bg-muted">
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" /> : null}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 font-medium">{item.productName || item.name}</p>
                            <p className="text-sm text-muted-foreground">{valueText(item)}</p>
                        </div>
                    </div>
                )) : <p className="py-8 text-center text-sm text-muted-foreground">Chưa có dữ liệu.</p>}
            </div>
        </div>
    );
}

export default function AdminStatisticsPage() {
    const [preset, setPreset] = useState<StatisticsFilterPreset>("today");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadStatistics() {
        if(preset === "custom" && (!fromDate || !toDate)) {
            toast.error("Vui lòng chọn đủ ngày bắt đầu và ngày kết thúc.");
            return;
        }

        try {
            setLoading(true);
            const data = await dashboardService.getStatistics({
                preset,
                fromDate: preset === "custom" ? fromDate : undefined,
                toDate: preset === "custom" ? toDate : undefined,
            });
            setStatistics(data);
        }catch(error: any) {
            toast.error(error?.message || "Không lấy được dữ liệu thống kê.");
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        if(preset !== "custom") loadStatistics();
    }, [preset]);

    const orderRateChart = useMemo(() => {
        if(!statistics) return [];

        return [
            { name: "Hoàn thành", value: statistics.orderStats.completedOrders, color: "#16a34a" },
            { name: "Đã hủy", value: statistics.orderStats.cancelledOrders, color: "#dc2626" },
            { name: "Giao thất bại", value: statistics.orderStats.deliveryFailedOrders, color: "#f97316" },
        ].filter((item) => item.value > 0);
    }, [statistics]);

    return (
        <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold">Thống kê chi tiết</h2>
                    <p className="text-sm text-muted-foreground">
                        Tổng hợp doanh thu, đơn hàng, khách hàng và bảo hành theo bộ lọc.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Select value={preset} onValueChange={(value) => setPreset(value as StatisticsFilterPreset)}>
                        <SelectTrigger className="w-44 bg-white">
                            <SelectValue placeholder="Chọn bộ lọc" />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(filterLabels) as StatisticsFilterPreset[]).map((value) => (
                                <SelectItem key={value} value={value}>{filterLabels[value]}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {preset === "custom" ? (
                        <>
                            <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="w-40 bg-white" />
                            <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="w-40 bg-white" />
                            <Button type="button" onClick={loadStatistics}>Lọc</Button>
                        </>
                    ) : null}
                </div>
            </div>

            {loading && !statistics ? (
                <div className="rounded-md border bg-white p-8 text-center text-muted-foreground">Đang tải thống kê...</div>
            ) : null}

            {statistics ? (
                <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard label="Tổng doanh thu" value={formatMoney(statistics.summary.totalRevenue)} sub={filterLabels[statistics.filter.preset]} icon={Wallet} />
                        <StatCard label="Tổng số đơn" value={formatNumber(statistics.summary.totalOrders)} sub="Tất cả đơn tạo trong kỳ" icon={ReceiptText} />
                        <StatCard label="Giá trị đơn trung bình" value={formatMoney(statistics.summary.averageOrderValue)} sub="Doanh thu / tổng số đơn" icon={ShoppingCart} />
                        <StatCard label="Khách hàng mới" value={formatNumber(statistics.summary.newCustomers)} sub={`${formatNumber(statistics.summary.totalCustomers)} khách hàng tổng`} icon={UserPlus} />
                        <StatCard label="Đơn hoàn thành" value={formatNumber(statistics.orderStats.completedOrders)} sub={`${statistics.orderStats.successRate}% giao thành công`} icon={PackageCheck} />
                        <StatCard label="Đơn đã hủy" value={formatNumber(statistics.orderStats.cancelledOrders)} sub={`${statistics.orderStats.cancelRate}% hủy đơn`} icon={ChartColumn} />
                        <StatCard label="Đơn giao thất bại" value={formatNumber(statistics.orderStats.deliveryFailedOrders)} sub={`${statistics.orderStats.deliveryFailedRate}% thất bại`} icon={ChartColumn} />
                        <StatCard label="Yêu cầu bảo hành" value={formatNumber(statistics.summary.warrantyRequests)} sub="Tạo trong kỳ lọc" icon={ShieldCheck} />
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                        <div className="rounded-md border bg-white p-4">
                            <div className="mb-4">
                                <h3 className="font-semibold">Biểu đồ doanh thu</h3>
                                <p className="text-sm text-muted-foreground">Dạng cột theo {statistics.filter.chartUnit === "hour" ? "2 giờ" : statistics.filter.chartUnit}</p>
                            </div>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statistics.revenueChart}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis tickFormatter={(value) => `${Number(value) / 1000000}tr`} tick={{ fontSize: 12 }} width={56} />
                                        <Tooltip formatter={(value) => formatMoney(Number(value))} />
                                        <Bar dataKey="revenue" name="Doanh thu" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-md border bg-white p-4">
                            <h3 className="mb-4 font-semibold">Tỷ lệ đơn hàng</h3>
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
                                <p className="py-8 text-center text-sm text-muted-foreground">Chưa có dữ liệu tỷ lệ đơn hàng.</p>
                            )}
                            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                <div className="rounded-md bg-emerald-50 p-2 text-emerald-700">{statistics.orderStats.successRate}% thành công</div>
                                <div className="rounded-md bg-red-50 p-2 text-red-700">{statistics.orderStats.cancelRate}% hủy</div>
                                <div className="rounded-md bg-orange-50 p-2 text-orange-700">{statistics.orderStats.deliveryFailedRate}% thất bại</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                        <ProductList
                            title="Top sản phẩm bán chạy"
                            products={statistics.topSellingProducts}
                            valueText={(item) => `${formatNumber(item.sold)} sản phẩm · ${formatMoney(item.revenue)}`}
                        />
                        <ProductList
                            title="Sản phẩm doanh thu cao nhất"
                            products={statistics.topRevenueProducts}
                            valueText={(item) => `${formatMoney(item.revenue)} · ${formatNumber(item.sold)} sản phẩm`}
                        />
                    </div>

                    <div className="rounded-md border bg-white p-4">
                        <h3 className="mb-4 font-semibold">Sản phẩm bảo hành nhiều nhất</h3>
                        <div className="space-y-3">
                            {statistics.topWarrantyProducts.length ? statistics.topWarrantyProducts.map((item, index) => (
                                <div key={`${item.productId}-${index}`} className="flex items-center gap-3 rounded-md border p-3">
                                    <div className="flex size-8 items-center justify-center rounded-md bg-blue-50 text-sm font-bold text-blue-700">{index + 1}</div>
                                    <div className="flex size-14 shrink-0 items-center justify-center bg-muted">
                                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" /> : null}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-1 font-medium">{item.productName || item.name}</p>
                                        <p className="text-sm text-muted-foreground">{formatNumber(item.warrantyCount)} yêu cầu bảo hành</p>
                                    </div>
                                </div>
                            )) : <p className="py-8 text-center text-sm text-muted-foreground">Chưa có dữ liệu bảo hành sản phẩm.</p>}
                        </div>
                    </div>
                </>
            ) : null}
        </section>
    );
}
