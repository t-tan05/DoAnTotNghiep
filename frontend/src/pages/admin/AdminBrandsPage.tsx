import BrandFormDialog from "@/components/admin/catalog/BrandFormDialog";
import type { AdminColumn } from "@/components/admin/table/AdminDataTable";
import AdminDataTable from "@/components/admin/table/AdminDataTable";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { brandService } from "@/services/brand.service";
import type { SortOrder } from "@/types/admin-table.type";
import type { Brand, BrandSortBy } from "@/types/brand.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const columns: AdminColumn<Brand>[] = [
    {
        key: "brand_name",
        title: "Tên thương hiệu",
        sortable: true,
    },
    {
        key: "description",
        title: "Mô tả",
        render: (brand) => brand.description || "Không có mô tả",
    },
];

export default function AdminBrandPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null> (null);
    const [openForm, setOpenForm] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<BrandSortBy>("brand_name");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);
    const [deleting, setDeleting] = useState(false);

    async function fetchBrands() {
        try{
            setLoading(true);

            const data = await brandService.getAll({
                page,
                limit,
                search,
                sortBy,
                sortOrder,
            });

            setBrands(data?.brands ?? []);
            setTotalPages(data?.meta.pagination.totalPages ?? 1);
        }catch(error){
            toast.error(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        const timer = window.setTimeout(() => {
            fetchBrands();
        }, 300);

        return () => window.clearTimeout(timer);
    }, [page, search, sortBy, sortOrder]);

    function handleSortChange(nextSortBy: string) {
        if(nextSortBy !== "brand_name") return;

        if(sortBy === nextSortBy) {
            setSortOrder((current) => current === "asc" ? "desc" : "asc");
            return;
        }

        setSortBy(nextSortBy);
        setSortOrder("asc");
    }

    function handleAdd() {
        setSelectedBrand(null);
        setOpenForm(true);
    }

    function handleEdit(brand: Brand) {
        setSelectedBrand(brand);
        setOpenForm(true);
    }

    async function handleDelete(brand: Brand) {
        setDeleteBrand(brand);
    }

    async function handleConfirmDelete() {
        if(!deleteBrand) return;

        try {
            setDeleting(true);
            await brandService.remove(deleteBrand.brand_id);
            toast.success("Xóa thương hiệu thành công");
            setDeleteBrand(null);
            fetchBrands();
        }catch(error){
            toast.error(getErrorMessage(error));
        }finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <AdminDataTable 
                title="Quản lý thương hiệu"
                description="Thêm, sửa, xóa và tìm kiếm thương hiệu sản phẩm."
                items={brands}
                columns={columns}
                idKey="brand_id"
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
                onDelete={handleDelete}
            />
            <BrandFormDialog 
                open={openForm}
                brand={selectedBrand}
                onOpenChange={setOpenForm}
                onSuccess={fetchBrands}
            />

            <ConfirmDeleteDialog 
                open={Boolean(deleteBrand)}
                loading={deleting}
                title="Xóa thương hiệu"
                description={`Bạn có chắc muốn xóa thương hiệu "${deleteBrand?.brand_name}" không?`}
                onOpenChange={(open) => {
                    if(!open) setDeleteBrand(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </>
    )
}