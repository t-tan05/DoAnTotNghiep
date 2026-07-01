import AdminDataTable, { type AdminColumn } from "@/components/admin/table/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { socket } from "@/lib/socket";
import { warrantyService } from "@/services/warranty.service";
import type { SortOrder } from "@/types/admin-table.type";
import type {
    StaffWarrantyListQuery,
    Warranty,
    WarrantyRequestChannel,
    WarrantyServiceMethod,
    WarrantyStatus,
} from "@/types/warranty.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import WarrantyStatusBadge from "@/components/profile/WarrantyStatusBadge";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Props = {
    basePath: string;
};

const columns: AdminColumn<Warranty>[] = [
    {
        key: "warranty_code",
        title: "Mã phiếu",
        render: (warranty) => warranty.warranty_code,
    },
    {
        key: "created_at",
        title: "Ngày tạo",
        sortable: true,
        render: (warranty) => new Date(warranty.created_at).toLocaleString("vi-VN"),
    },
    {
        key: "device",
        title: "Thiết bị",
        render: (warranty) => {
            const variant = warranty.devices.product_variants;
            return (
                <div>
                    <div className="font-medium">{variant.variant_name || variant.products.product_name}</div>
                    <div className="text-xs text-muted-foreground">Serial: {warranty.devices.serial_number}</div>
                </div>
            );
        },
    },
    {
        key: "customer",
        title: "Khách hàng",
        render: (warranty) => (
            <div>
                <div className="font-medium">{warranty.users?.name || "-"}</div>
                <div className="text-xs text-muted-foreground">{warranty.users?.email || "-"}</div>
            </div>
        ),
    },
    {
        key: "status",
        title: "Trạng thái",
        sortable: true,
        render: (warranty) => <WarrantyStatusBadge status={warranty.status} />,
    },
    {
        key: "service_method",
        title: "Hình thức",
        render: (warranty) => warranty.service_method,
    },
    {
        key: "employee",
        title: "Nhân viên",
        render: (warranty) => {
            const employee = warranty.users_warranties_assigned_employee_idTousers;
            return employee?.name || <span className="text-muted-foreground">Chưa có</span>;
        },
    },
];

export default function StaffWarrantiesPage({basePath}: Props) {
    const navigate = useNavigate();

    const [warranties, setWarranties] = useState<Warranty[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<WarrantyStatus | "">("");
    const [requestChannel, setRequestChannel] = useState<WarrantyRequestChannel | "">("");
    const [serviceMethod, setServiceMethod] = useState<WarrantyServiceMethod | "">("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [sortBy, setSortBy] = useState<"created_at" | "updated_at" | "received_date" | "pickup_scheduled_at" | "return_scheduled_at">("created_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    const loadWarranties = useCallback(async() => {
        try {
            setLoading(true);

            const query: StaffWarrantyListQuery = {
                page,
                limit: 10,
                search: search.trim() || undefined,
                status: status || undefined,
                requestChannel: requestChannel || undefined,
                serviceMethod: serviceMethod || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                sortBy,
                sortOrder,
            };

            const data = await warrantyService.getAllForStaff(query);
            setWarranties(data.warranties);
            setTotalPages(data.meta.pagination.totalPages);
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [page, search, status, requestChannel, serviceMethod, fromDate, toDate, sortBy, sortOrder]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            loadWarranties();
        }, 300);

        return () => window.clearTimeout(timer);
    }, [loadWarranties]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if(!token) return;

        function handleConnect() {
            socket.emit("join_warranty_staff");
        }

        function handleWarrantyChanged() {
            loadWarranties();
        }

        socket.auth = { token };
        socket.on("connect", handleConnect);
        socket.on("warranty:new", handleWarrantyChanged);
        socket.on("warranty:updated", handleWarrantyChanged);

        if(!socket.connected) {
            socket.connect();
        } else {
            socket.emit("join_warranty_staff");
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("warranty:new", handleWarrantyChanged);
            socket.off("warranty:updated", handleWarrantyChanged);
        };
    }, [loadWarranties]);

    function handleSortChange(nextSortBy: string) {
        if(!["created_at", "updated_at", "received_date", "pickup_scheduled_at", "return_scheduled_at"].includes(nextSortBy)) return;

        if(sortBy === nextSortBy) {
            setSortOrder((current) => current === "asc" ? "desc" : "asc");
            return;
        }

        setSortBy(nextSortBy as typeof sortBy);
        setSortOrder(nextSortBy === "created_at" ? "desc" : "asc");
    }

    function clearFilters() {
        setStatus("");
        setRequestChannel("");
        setServiceMethod("");
        setFromDate("");
        setToDate("");
        setPage(1);
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-3 xl:grid-cols-6">
                <select
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value as WarrantyStatus | "");
                        setPage(1);
                    }}
                    className="h-10 cursor-pointer rounded-md border bg-background px-3 text-sm"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="REQUESTED">Chờ tiếp nhận</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="PICKUP_SCHEDULED">Đã hẹn lấy máy</option>
                    <option value="RECEIVED">Đã nhận máy</option>
                    <option value="INSPECTING">Đang kiểm tra</option>
                    <option value="IN_PROGRESS">Đang xử lý</option>
                    <option value="SENT_TO_BRAND">Đã gửi hãng</option>
                    <option value="COMPLETED">Đã xử lý xong</option>
                    <option value="RETURNED">Đã trả máy</option>
                    <option value="REJECTED">Đã từ chối</option>
                    <option value="CANCELLED">Đã hủy</option>
                </select>

                <select
                    value={requestChannel}
                    onChange={(event) => {
                        setRequestChannel(event.target.value as WarrantyRequestChannel | "");
                        setPage(1);
                    }}
                    className="h-10 cursor-pointer rounded-md border bg-background px-3 text-sm"
                >
                    <option value="">Tất cả kênh</option>
                    <option value="ONLINE">Online</option>
                    <option value="STORE">Tại cửa hàng</option>
                    <option value="HOTLINE">Hotline</option>
                </select>

                <select
                    value={serviceMethod}
                    onChange={(event) => {
                        setServiceMethod(event.target.value as WarrantyServiceMethod | "");
                        setPage(1);
                    }}
                    className="h-10 cursor-pointer rounded-md border bg-background px-3 text-sm"
                >
                    <option value="">Tất cả hình thức</option>
                    <option value="PICKUP">Đến lấy máy</option>
                    <option value="DROP_OFF">Khách mang tới</option>
                    <option value="SHIPPING">Khách tự gửi</option>
                </select>

                <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="cursor-pointer" />
                <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="cursor-pointer" />

                <Button type="button" variant="outline" onClick={clearFilters} className="cursor-pointer">
                    Xóa lọc
                </Button>
            </div>

            <AdminDataTable
                title="Quản lý bảo hành"
                description="Theo dõi, tìm kiếm và xử lý tiến độ bảo hành."
                items={warranties}
                columns={columns}
                idKey="warranty_id"
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
                onView={(warranty) => navigate(`${basePath}/${warranty.warranty_id}`)}
            />
        </div>
    );
}
