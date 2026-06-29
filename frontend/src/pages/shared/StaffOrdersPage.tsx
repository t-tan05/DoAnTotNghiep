import { orderService } from "@/services/order.service";
import type {
    OrderPaymentStatus,
    OrderStatus,
    PaymentMethod,
    StaffOrder,
    StaffOrderListQuery,
} from "@/types/order.type";
import {
    getOrderStatusLabel,
    getPaymentMethodLabel,
    getPaymentStatusLabel,
} from "@/utils/orderFormat";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AdminColumn } from "@/components/admin/table/AdminDataTable";
import type { SortOrder } from "@/types/admin-table.type";
import OrderFilterBar from "@/components/admin/order/OrderFilterBar";
import AdminDataTable from "@/components/admin/table/AdminDataTable";
import { socket } from "@/lib/socket";

type Props = {
    basePath: string;
};

const columns: AdminColumn<StaffOrder>[] = [
    {
        key: "order_id",
        title: "Mã đơn",
        render: (order) => `#${order.order_id.slice(0, 8)}`,
    },
    {
        key: "order_date",
        title: "Ngày đặt",
        sortable: true,
        render: (order) => new Date(order.order_date).toLocaleString("vi-VN"),
    },
    {
        key: "customer",
        title: "Khách hàng",
        render: (order) => (
            <div className="">
                <div className="font-medium">
                    {order.users_orders_user_idTousers?.name || "-"}
                </div>
                <div className="text-xs text-muted-foreground">
                    {order.users_orders_user_idTousers?.email || "-"}
                </div>
            </div>
        ),
    },
    {
        key: "receiver",
        title: "Người nhận",
        render: (order) => (
            <div>
                <div>{order.receiver_name || "-"}</div>
                <div className="text-xs text-muted-foreground">
                    {order.receiver_phone || "-"}
                </div>
            </div>
        ),
    },
    {
        key: "total_price",
        title: "Tổng tiền",
        sortable: true,
        render: (order) => `${Number(order.total_price).toLocaleString("vi-VN")}đ`,
    },
    {
        key: "status",
        title: "Trạng thái",
        sortable: true,
        render: (order) => getOrderStatusLabel(order.status),
    },
    {
        key: "employee",
        title: "Nhân viên xử lý",
        render: (order) => {
            const employee = order.users_orders_employee_idTousers;

            if (!employee) {
                return <span className="text-muted-foreground">Chưa có</span>;
            }

            return (
                <div>
                    <div className="font-medium">{employee.name}</div>
                </div>
            );
        },
    },
    {
        key: "payment_status",
        title: "Thanh toán",
        render: (order) => (
            <div>
                <div>{getPaymentStatusLabel(order.payment_status)}</div>
                <div className="text-xs text-muted-foreground">
                    {getPaymentMethodLabel(order.payment_method)}
                </div>
            </div>
        ),
    },
];

export default function StaffOrdersPage({basePath}: Props) {
    const navigate = useNavigate();

    const [orders, setOrders] = useState<StaffOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<OrderStatus | ""> ("");
    const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus | "">("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [sortBy, setSortBy] = useState<"order_date" | "total_price" | "status">("order_date");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    const loadOrders = useCallback(async() => {
        try {
            setLoading(true);

            const query: StaffOrderListQuery = {
                page,
                limit: 10,
                search: search.trim() || undefined,
                status: status || undefined,
                paymentStatus: paymentStatus || undefined,
                paymentMethod: paymentMethod || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                sortBy,
                sortOrder,
            };

            const data = await orderService.getAllForStaff(query);

            setOrders(data.orders);
            setTotalPages(data.meta.pagination.totalPages);
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [page, search, status, paymentStatus, paymentMethod, fromDate, toDate, sortBy, sortOrder]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if(!token) return;

        function handleConnect() {
            socket.emit("join_admin");
        }

        function handleConnectError() {
            toast.error("Không thể kết nối realtime. Vui lòng đăng nhập lại.");
        }

        function handleOrderChanged() {
            loadOrders();
        }

        socket.auth = { token };

        socket.on("connect", handleConnect);
        socket.on("connect_error", handleConnectError);
        socket.on("order:new", handleOrderChanged);
        socket.on("order:updated", handleOrderChanged);

        if(!socket.connected) {
            socket.connect();
        } else {
            socket.emit("join_admin");
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("connect_error", handleConnectError);
            socket.off("order:new", handleOrderChanged);
            socket.off("order:updated", handleOrderChanged);
        };
    }, [loadOrders]);

    useEffect(() => {
        setLoading(true);

        const timer = window.setTimeout(() => {
            loadOrders();
        }, 300);

        return () => window.clearTimeout(timer);
    }, [page, search, status, paymentStatus, paymentMethod, fromDate, toDate, sortBy, sortOrder]);

    function handleSortChange(nextSortBy: string) {
        if(!["order_date", "total_price", "status"].includes(nextSortBy)) return;

        if(sortBy === nextSortBy) {
            setSortOrder((current) => current === "asc" ? "desc" : "asc");
            return;
        }

        setSortBy(nextSortBy as "order_date" | "total_price" | "status");
        setSortOrder(nextSortBy === "order_date" ? "desc" : "asc");
    }

    return (
        <div className="space-y-4">
            <OrderFilterBar
                status={status}
                paymentStatus={paymentStatus}
                paymentMethod={paymentMethod}
                fromDate={fromDate}
                toDate={toDate}
                onStatusChange={(value) => {
                    setStatus(value);
                    setPage(1);
                }}
                onPaymentStatusChange={(value) => {
                    setPaymentStatus(value);
                    setPage(1);
                }}
                onPaymentMethodChange={(value) => {
                    setPaymentMethod(value);
                    setPage(1);
                }}
                onFromDateChange={(value) => {
                    setFromDate(value);
                    setPage(1);
                }}
                onToDateChange={(value) => {
                    setToDate(value);
                    setPage(1);
                }}
                onClear={() => {
                    setStatus("");
                    setPaymentStatus("");
                    setPaymentMethod("");
                    setFromDate("");
                    setToDate("");
                    setPage(1);
                }}
            />

            <AdminDataTable
                title="Quản lý đơn hàng"
                description="Theo dõi, tìm kiếm và xử lý trạng thái đơn hàng."
                items={orders}
                columns={columns}
                idKey="order_id"
                search={search}
                page={page}
                totalPages={totalPages}
                sortBy={sortBy}
                sortOrder={sortOrder}
                loading={loading}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                onPageChange={setPage}
                onSortChange={handleSortChange}
                onView={(order) => navigate(`${basePath}/${order.order_id}`)}
            />
        </div>
    )
}