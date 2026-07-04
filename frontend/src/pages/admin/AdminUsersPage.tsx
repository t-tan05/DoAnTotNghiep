import type { AdminColumn } from "@/components/admin/table/AdminDataTable";
import AdminDataTable from "@/components/admin/table/AdminDataTable";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { userService } from "@/services/user.service";
import type { SortOrder } from "@/types/admin-table.type";
import type { AdminUser, UserRole, UserSortBy, UserStatus } from "@/types/user.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Lock, RotateCcw, Unlock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
    ADMIN: "Quản trị",
    EMPLOYEE: "Nhân viên",
    CUSTOMER: "Khách hàng",
};

const statusLabels: Record<UserStatus, string> = {
    ACTIVE: "Đang hoạt động",
    LOCKED: "Đã khóa",
};

function getRoleText(user: AdminUser) {
    return user.users_roles
        .map((role) => roleLabels[role.role_name] ?? role.role_name)
        .join(", ");
}

function booleanText(value: boolean) {
    return value ? "Có" : "Không";
}

function formatDateTime(value?: string | null) {
    if(!value) return "-";

    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}

type EmployeeDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

function EmployeeFormDialog({ open, onOpenChange, onSuccess }: EmployeeDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if(!open) return;

        setForm({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        });
        setError("");
    }, [open]);

    function updateField(name: keyof typeof form, value: string) {
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if(!form.name.trim()) return setError("Vui lòng nhập tên nhân viên.");
        if(!form.email.trim()) return setError("Vui lòng nhập email.");
        if(!form.password) return setError("Vui lòng nhập mật khẩu.");
        if(form.password !== form.confirmPassword) return setError("Mật khẩu xác nhận không khớp.");

        try {
            setLoading(true);
            await userService.createEmployee({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                confirmPassword: form.confirmPassword,
            });
            toast.success("Tạo tài khoản nhân viên thành công.");
            onOpenChange(false);
            onSuccess();
        } catch(error) {
            const message = getErrorMessage(error);
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Thêm tài khoản nhân viên</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormError message={error} />

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label>Họ tên</Label>
                            <Input
                                value={form.name}
                                onChange={(event) => updateField("name", event.target.value)}
                                placeholder="Ví dụ: Nguyễn Văn A"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={form.email}
                                onChange={(event) => updateField("email", event.target.value)}
                                placeholder="employee@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Mật khẩu</Label>
                            <Input
                                type="password"
                                value={form.password}
                                onChange={(event) => updateField("password", event.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Xác nhận mật khẩu</Label>
                            <Input
                                type="password"
                                value={form.confirmPassword}
                                onChange={(event) => updateField("confirmPassword", event.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={loading}
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                        <SpinnerButton type="submit" loading={loading} loadingText="Đang tạo...">
                            Tạo nhân viên
                        </SpinnerButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

type LockDialogProps = {
    user: AdminUser | null;
    loading: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: string) => void;
};

function LockUserDialog({ user, loading, onOpenChange, onConfirm }: LockDialogProps) {
    const [reason, setReason] = useState("");

    useEffect(() => {
        if(user) setReason("");
    }, [user]);

    return (
        <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Khóa tài khoản</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Tài khoản <span className="font-medium text-foreground">{user?.email}</span> sẽ không thể tiếp tục sử dụng hệ thống.
                    </p>

                    <div className="space-y-2">
                        <Label>Lý do khóa</Label>
                        <Textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="Nhập lý do để dễ theo dõi nội bộ..."
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => onOpenChange(false)}
                    >
                        Hủy
                    </Button>
                    <SpinnerButton
                        type="button"
                        loading={loading}
                        loadingText="Đang khóa..."
                        onClick={() => onConfirm(reason.trim())}
                    >
                        Khóa tài khoản
                    </SpinnerButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [openEmployeeForm, setOpenEmployeeForm] = useState(false);
    const [lockUser, setLockUser] = useState<AdminUser | null>(null);
    const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<UserSortBy>("name");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [totalPages, setTotalPages] = useState(1);

    const [role, setRole] = useState<"all" | Exclude<UserRole, "ADMIN">>("all");
    const [status, setStatus] = useState<"all" | UserStatus>("all");
    const [verified, setVerified] = useState("all");
    const [mustChangePassword, setMustChangePassword] = useState("all");

    async function fetchUsers() {
        try {
            setLoading(true);

            const data = await userService.getAll({
                page,
                limit,
                search,
                sortBy,
                sortOrder,
                role: role === "all" ? undefined : role,
                status: status === "all" ? undefined : status,
                verified: verified === "all" ? undefined : verified === "true",
                mustChangePassword: mustChangePassword === "all" ? undefined : mustChangePassword === "true",
            });

            setUsers(data?.users ?? []);
            setTotalPages(data?.meta.pagination.totalPages ?? 1);
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        const timer = window.setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => window.clearTimeout(timer);
    }, [page, search, sortBy, sortOrder, role, status, verified, mustChangePassword]);

    function handleSortChange(nextSortBy: string) {
        if(!["name", "email", "status", "verified"].includes(nextSortBy)) return;

        if(sortBy === nextSortBy) {
            setSortOrder((current) => current === "asc" ? "desc" : "asc");
            return;
        }

        setSortBy(nextSortBy as UserSortBy);
        setSortOrder("asc");
    }

    function resetFilters() {
        setSearch("");
        setRole("all");
        setStatus("all");
        setVerified("all");
        setMustChangePassword("all");
        setPage(1);
    }

    async function handleLock(reason: string) {
        if(!lockUser) return;

        try {
            setActionLoading(true);
            await userService.lock(lockUser.user_id, { reason: reason || undefined });
            toast.success("Khóa tài khoản thành công.");
            setLockUser(null);
            fetchUsers();
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUnlock(user: AdminUser) {
        try {
            setActionLoading(true);
            await userService.unlock(user.user_id);
            toast.success("Mở khóa tài khoản thành công.");
            fetchUsers();
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDelete() {
        if(!deleteUser) return;

        try {
            setActionLoading(true);
            await userService.remove(deleteUser.user_id);
            toast.success("Xóa tài khoản thành công.");
            setDeleteUser(null);
            fetchUsers();
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setActionLoading(false);
        }
    }

    const columns = useMemo<AdminColumn<AdminUser>[]>(() => [
        {
            key: "name",
            title: "Người dùng",
            sortable: true,
            render: (user) => (
                <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.user_id}</p>
                </div>
            ),
        },
        {
            key: "email",
            title: "Email",
            sortable: true,
        },
        {
            key: "roles",
            title: "Vai trò",
            render: (user) => (
                <div className="flex flex-wrap gap-1">
                    {user.users_roles.map((role) => (
                        <Badge key={role.role_name} variant="outline">
                            {roleLabels[role.role_name] ?? role.role_name}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            key: "verified",
            title: "Xác thực email",
            sortable: true,
            render: (user) => booleanText(user.verified),
        },
        {
            key: "must_change_password",
            title: "Đổi mật khẩu",
            render: (user) => booleanText(user.must_change_password),
        },
        {
            key: "status",
            title: "Trạng thái",
            sortable: true,
            render: (user) => (
                <div className="space-y-2">
                    <Badge variant={user.status === "ACTIVE" ? "default" : "destructive"}>
                        {statusLabels[user.status]}
                    </Badge>
                    {user.status === "LOCKED" ? (
                        <div className="text-xs text-muted-foreground">
                            <p>{user.locked_reason || "Không có lý do"}</p>
                            <p>{formatDateTime(user.locked_at)}</p>
                        </div>
                    ) : null}
                </div>
            ),
        },
        {
            key: "account_action",
            title: "Khóa/Mở khóa",
            render: (user) => user.status === "LOCKED" ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleUnlock(user)}
                >
                    <Unlock className="h-3.5 w-3.5" />
                    Mở khóa
                </Button>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => setLockUser(user)}
                >
                    <Lock className="h-3.5 w-3.5" />
                    Khóa
                </Button>
            ),
        },
    ], [actionLoading]);

    const filters = (
        <div className="grid gap-3 rounded-md border bg-background p-4 md:grid-cols-4">
            <div className="space-y-2">
                <Label>Vai trò</Label>
                <Select
                    value={role}
                    onValueChange={(value) => {
                        setRole(value as typeof role);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                        <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
                        <SelectItem value="EMPLOYEE">Nhân viên</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                    value={status}
                    onValueChange={(value) => {
                        setStatus(value as typeof status);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                        <SelectItem value="LOCKED">Đã khóa</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Xác thực email</Label>
                <Select
                    value={verified}
                    onValueChange={(value) => {
                        setVerified(value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="true">Đã xác thực</SelectItem>
                        <SelectItem value="false">Chưa xác thực</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Yêu cầu đổi mật khẩu</Label>
                <Select
                    value={mustChangePassword}
                    onValueChange={(value) => {
                        setMustChangePassword(value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="true">Có yêu cầu</SelectItem>
                        <SelectItem value="false">Không yêu cầu</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

    const headerActions = (
        <Button
            type="button"
            variant="outline"
            onClick={resetFilters}
            className="h-12 cursor-pointer"
        >
            <RotateCcw className="mr-2 h-4 w-4" />
            Xóa lọc
        </Button>
    );

    return (
        <>
            <AdminDataTable
                title="Quản lý người dùng"
                description="Quản lý tài khoản khách hàng và nhân viên: tìm kiếm, lọc, phân trang, khóa/mở khóa hoặc xóa tài khoản."
                items={users}
                columns={columns}
                idKey="user_id"
                search={search}
                page={page}
                totalPages={totalPages}
                sortBy={sortBy}
                sortOrder={sortOrder}
                loading={loading}
                headerActions={headerActions}
                filters={filters}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                onPageChange={setPage}
                onSortChange={handleSortChange}
                onAdd={() => setOpenEmployeeForm(true)}
                onDelete={setDeleteUser}
            />

            <EmployeeFormDialog
                open={openEmployeeForm}
                onOpenChange={setOpenEmployeeForm}
                onSuccess={fetchUsers}
            />

            <LockUserDialog
                user={lockUser}
                loading={actionLoading}
                onOpenChange={(open) => {
                    if(!open) setLockUser(null);
                }}
                onConfirm={handleLock}
            />

            <ConfirmDeleteDialog
                open={Boolean(deleteUser)}
                loading={actionLoading}
                title="Xóa tài khoản"
                description={`Bạn có chắc muốn xóa tài khoản "${deleteUser?.email}" (${deleteUser ? getRoleText(deleteUser) : ""}) không?`}
                onOpenChange={(open) => {
                    if(!open) setDeleteUser(null);
                }}
                onConfirm={handleDelete}
            />
        </>
    );
}
