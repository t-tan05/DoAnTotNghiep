import CategoryFormDialog from "@/components/admin/catalog/CategoryFormDialog";
import type { AdminColumn } from "@/components/admin/table/AdminDataTable";
import AdminDataTable from "@/components/admin/table/AdminDataTable";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { categoryService } from "@/services/category.service";
import type { SortOrder } from "@/types/admin-table.type";
import type { Category, CategorySortBy } from "@/types/category.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const columns: AdminColumn<Category>[] = [
    {
        key: "category_name",
        title: "Tên danh mục",
        sortable: true,
    },
    {
        key: "description",
        title: "Mô tả",
        render: (category) => category.description || "Không có mô tả",
    },
];

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null> (null);
    const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
    const [openForm, setOpenForm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<CategorySortBy>("category_name");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    async function fetchCategories() {
        try{
            setLoading(true);

            const data = await categoryService.getAll({
                page,
                limit,
                search,
                sortBy,
                sortOrder,
            });

            setCategories(data?.categories ?? []);
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
            fetchCategories();
        }, 300);

        return () => window.clearTimeout(timer);
    }, [page, search, sortBy, sortOrder]);

    function handleSortChange(nextSortBy: string) {
        if(nextSortBy !== "category_name") return;

        if(sortBy === nextSortBy) {
            setSortOrder((current) => current === "asc" ? "desc" : "asc");
            return;
        }

        setSortBy(nextSortBy);
        setSortOrder("asc");
    }

    function handleAdd() {
        setSelectedCategory(null);
        setOpenForm(true);
    }

    function handleEdit(category: Category) {
        setSelectedCategory(category);
        setOpenForm(true);
    }

    async function handleDelete(category: Category) {
        setDeleteCategory(category);
    }

    async function handleConfirmDelete() {
        if(!deleteCategory) return;

        try {
            setDeleting(true);
            await categoryService.remove(deleteCategory.category_id);
            toast.success("Xóa danh mục thành công");
            setDeleteCategory(null);
            fetchCategories();
        }catch(error){
            toast.error(getErrorMessage(error));
        }finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <AdminDataTable 
                title="Quản lý danh mục"
                description="Thêm, sửa, xóa và tìm kiếm danh mục sản phẩm."
                items={categories}
                columns={columns}
                idKey="category_id"
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
            <CategoryFormDialog 
                open={openForm}
                category={selectedCategory}
                onOpenChange={setOpenForm}
                onSuccess={fetchCategories}
            />

            <ConfirmDeleteDialog 
                open={Boolean(deleteCategory)}
                loading={deleting}
                title="Xóa danh mục"
                description={`Bạn có chắc muốn xóa danh mục "${deleteCategory?.category_name}" không?`}
                onOpenChange={(open) => {
                    if(!open) setDeleteCategory(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </>
    )
}