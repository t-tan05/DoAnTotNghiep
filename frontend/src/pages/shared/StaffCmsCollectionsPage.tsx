import CmsCollectionFormDialog from "@/components/admin/cms/CmsCollectionFormDialog";
import type { AdminColumn } from "@/components/admin/table/AdminDataTable";
import AdminDataTable from "@/components/admin/table/AdminDataTable";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { cmsService } from "@/services/cms.service";
import type { SortOrder } from "@/types/admin-table.type";
import type { CmsCollection, CmsCollectionSortBy, CmsPageType } from "@/types/cms.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Props = {
    basePath: string;
    canDelete?: boolean;
};

const pageTypeLabel: Record<CmsPageType, string> = {
    HOME: "Trang chủ",
    CATEGORY: "Danh mục",
    BRAND: "Thương hiệu",
    CAMPAIGN: "Chiến dịch",
    CUSTOM: "Tùy chỉnh",
};

const columns: AdminColumn<CmsCollection>[] = [
    {
        key: "title",
        title: "Tên bộ sưu tập",
        sortable: true,
        render: (collection) => (
            <div>
                <p className="font-medium">{collection.title}</p>
                <p className="text-xs text-muted-foreground">/{collection.slug}</p>
            </div>
        ),
    },
    {
        key: "page_type",
        title: "Loại trang",
        render: (collection) => pageTypeLabel[collection.page_type] ?? collection.page_type,
    },
    {
        key: "target",
        title: "Áp dụng cho",
        render: (collection) => {
            if(collection.categories?.category_name) return collection.categories.category_name;
            if(collection.brands?.brand_name) return collection.brands.brand_name;
            return "Toàn hệ thống";
        },
    },
    {
        key: "count",
        title: "Nội dung",
        render: (collection) => (
            <div className="text-sm">
                <div>{collection._count?.cms_sections ?? collection.cms_sections?.length ?? 0} khu vực</div>
                <div className="text-muted-foreground">
                    {collection._count?.cms_collection_rules ?? collection.cms_collection_rules?.length ?? 0} quy tắc
                </div>
            </div>
        ),
    },
    {
        key: "is_active",
        title: "Trạng thái",
        render: (collection) => (
            <Badge variant={collection.is_active ? "default" : "secondary"}>
                {collection.is_active ? "Đang bật" : "Đang tắt"}
            </Badge>
        ),
    },
    {
        key: "sort_order",
        title: "Thứ tự",
        sortable: true,
    },
    {
        key: "created_at",
        title: "Ngày tạo",
        sortable: true,
        render: (collection) =>
            collection.created_at ? new Date(collection.created_at).toLocaleDateString("vi-VN") : "-",
    },
];

export default function StaffCmsCollectionsPage({ basePath, canDelete = false }: Props) {
    const navigate = useNavigate();

    const [collections, setCollections] = useState<CmsCollection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<CmsCollection | null>(null);
    const [deleteCollection, setDeleteCollection] = useState<CmsCollection | null>(null);

    const [openForm, setOpenForm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<CmsCollectionSortBy>("created_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [totalPages, setTotalPages] = useState(1);

    async function fetchCollections() {
        try {
            setLoading(true);

            const data = await cmsService.getAdminCollections({
                page,
                limit,
                search: search.trim() || undefined,
                sortBy,
                sortOrder,
            });

            setCollections(data.collections);
            setTotalPages(data.meta.pagination.totalPages);
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const timer = window.setTimeout(() => {
            fetchCollections();
        }, 300);

        return () => window.clearTimeout(timer);
    }, [page, search, sortBy, sortOrder]);

    function handleSortChange(nextSortBy: string) {
        if(!["title", "sort_order", "created_at"].includes(nextSortBy)) return;

        if(sortBy === nextSortBy) {
            setSortOrder((current) => current === "asc" ? "desc" : "asc");
            return;
        }

        setSortBy(nextSortBy as CmsCollectionSortBy);
        setSortOrder(nextSortBy === "created_at" ? "desc" : "asc");
    }

    async function handleConfirmDelete() {
        if(!deleteCollection) return;

        try {
            setDeleting(true);

            await cmsService.removeCollection(deleteCollection.collection_id);
            toast.success("Xóa bộ sưu tập CMS thành công.");
            setDeleteCollection(null);
            fetchCollections();
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <AdminDataTable
                title="Quản lý CMS"
                description="Quản lý bộ sưu tập hiển thị ở trang chủ, trang danh mục, trang đích và các khu vực nổi bật."
                items={collections}
                columns={columns}
                idKey="collection_id"
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
                onAdd={() => {
                    setSelectedCollection(null);
                    setOpenForm(true);
                }}
                onView={(collection) => navigate(`${basePath}/${collection.collection_id}`)}
                onEdit={(collection) => {
                    setSelectedCollection(collection);
                    setOpenForm(true);
                }}
                onDelete={canDelete ? setDeleteCollection : undefined}
            />

            <CmsCollectionFormDialog
                open={openForm}
                collection={selectedCollection}
                onOpenChange={setOpenForm}
                onSuccess={fetchCollections}
            />

            <ConfirmDeleteDialog
                open={Boolean(deleteCollection)}
                loading={deleting}
                title="Xóa bộ sưu tập CMS"
                description={`Bạn có chắc muốn xóa bộ sưu tập "${deleteCollection?.title}" không?`}
                onOpenChange={(open) => {
                    if(!open) setDeleteCollection(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
