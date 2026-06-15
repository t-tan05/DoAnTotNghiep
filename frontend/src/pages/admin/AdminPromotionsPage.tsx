import PromotionFormDialog from "@/components/admin/catalog/PromotionFormDialog";
import PromotionProductsDialog from "@/components/admin/catalog/PromotionProductsDialog";
import type { AdminColumn } from "@/components/admin/table/AdminDataTable";
import AdminDataTable from "@/components/admin/table/AdminDataTable";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { promotionService } from "@/services/promotion.service";
import type { SortOrder } from "@/types/admin-table.type";
import type { Promotion } from "@/types/promotion.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { PackagePlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}

function formatDiscount(promotion: Promotion) {
    const value = Number(promotion.discount_value);

    if (promotion.discount_type === "PERCENT") {
        return `${value}%`;
    }

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
}

function isPromotionRunning(promotion: Promotion) {
    const now = Date.now();
    return now >= new Date(promotion.start_date).getTime()
        && now <= new Date(promotion.end_date).getTime();
}

export default function AdminPromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);

    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [deletePromotion, setDeletePromotion] = useState<Promotion | null>(null);
    const [productsPromotion, setProductsPromotion] = useState<Promotion | null>(null);

    const [openForm, setOpenForm] = useState(false);
    const [openProductsDialog, setOpenProductsDialog] = useState(false);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [sortBy, setSortBy] = useState("start_date");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const filteredPromotions = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        const result = keyword
            ? promotions.filter((promotion) =>
                promotion.promotion_name.toLowerCase().includes(keyword)
                || promotion.description?.toLowerCase().includes(keyword)
            )
            : promotions;

        return [...result].sort((a, b) => {
            const aValue = a[sortBy as keyof Promotion];
            const bValue = b[sortBy as keyof Promotion];

            if (sortBy === "start_date" || sortBy === "end_date") {
                const diff = new Date(String(aValue)).getTime() - new Date(String(bValue)).getTime();
                return sortOrder === "asc" ? diff : -diff;
            }

            const diff = String(aValue ?? "").localeCompare(String(bValue ?? ""));
            return sortOrder === "asc" ? diff : -diff;
        });
    }, [promotions, search, sortBy, sortOrder]);

    const pagedPromotions = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredPromotions.slice(start, start + limit);
    }, [filteredPromotions, page, limit]);

    const totalPages = Math.max(1, Math.ceil(filteredPromotions.length / limit));

    const columns: AdminColumn<Promotion>[] = [
        {
            key: "promotion_name",
            title: "Tên khuyến mãi",
            sortable: true,
            render: (promotion) => (
                <div>
                    <p className="font-medium">{promotion.promotion_name}</p>
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                        {promotion.description || "Không có mô tả"}
                    </p>
                </div>
            ),
        },
        {
            key: "discount_value",
            title: "Giảm giá",
            render: formatDiscount,
        },
        {
            key: "start_date",
            title: "Thời gian",
            sortable: true,
            render: (promotion) => (
                <div className="text-sm">
                    <p>{formatDate(promotion.start_date)}</p>
                    <p className="text-muted-foreground">{formatDate(promotion.end_date)}</p>
                </div>
            ),
        },
        {
            key: "is_active",
            title: "Trạng thái",
            render: (promotion) => {
                const active = isPromotionRunning(promotion);

                return (
                    <Badge variant={active ? "default" : "secondary"}>
                        {active ? "Đang áp dụng" : "Không hoạt động"}
                    </Badge>
                );
            },
        },
        {
            key: "products",
            title: "Sản phẩm",
            render: (promotion) => (
                <div className="flex items-center gap-2">
                    <span>{promotion.products_promotions.length}</span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setProductsPromotion(promotion);
                            setOpenProductsDialog(true);
                        }}
                    >
                        <PackagePlus className="mr-1 h-4 w-4" />
                        Gán
                    </Button>
                </div>
            ),
        },
    ];

    async function fetchData(options?: { silent?: boolean }) {
        try {
            if (!options?.silent) setLoading(true);

            const promotionData = await promotionService.getAll();
            setPromotions(promotionData?.promotions ?? []);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            if (!options?.silent) setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();

        const intervalId = window.setInterval(() => {
            fetchData({ silent: true });
        }, 60_000);

        return () => window.clearInterval(intervalId);
    }, []);

    function handleSortChange(nextSortBy: string) {
        if (sortBy === nextSortBy) {
            setSortOrder((current) => current === "asc" ? "desc" : "asc");
            return;
        }

        setSortBy(nextSortBy);
        setSortOrder("asc");
    }

    function handleAdd() {
        setSelectedPromotion(null);
        setOpenForm(true);
    }

    function handleEdit(promotion: Promotion) {
        setSelectedPromotion(promotion);
        setOpenForm(true);
    }

    async function handleConfirmDelete() {
        if (!deletePromotion) return;

        try {
            setDeleting(true);
            await promotionService.remove(deletePromotion.promotion_id);
            toast.success("Xóa khuyến mãi thành công.");
            setDeletePromotion(null);
            fetchData();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <AdminDataTable
                title="Quản lý khuyến mãi"
                description="Tạo chương trình giảm giá và gán sản phẩm áp dụng."
                items={pagedPromotions}
                columns={columns}
                idKey="promotion_id"
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
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={setDeletePromotion}
            />

            <PromotionFormDialog
                open={openForm}
                promotion={selectedPromotion}
                onOpenChange={setOpenForm}
                onSuccess={fetchData}
            />

            <PromotionProductsDialog
                open={openProductsDialog}
                promotion={productsPromotion}
                onOpenChange={(open) => {
                    setOpenProductsDialog(open);
                    if (!open) setProductsPromotion(null);
                }}
                onSuccess={fetchData}
            />

            <ConfirmDeleteDialog
                open={Boolean(deletePromotion)}
                loading={deleting}
                title="Xóa khuyến mãi"
                description={`Bạn có chắc muốn xóa khuyến mãi "${deletePromotion?.promotion_name}" không?`}
                onOpenChange={(open) => {
                    if (!open) setDeletePromotion(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
