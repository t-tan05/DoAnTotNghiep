import ProductLineFormDialog from "@/components/admin/catalog/ProductLineFormDialog";
import type { AdminColumn } from "@/components/admin/table/AdminDataTable";
import AdminDataTable from "@/components/admin/table/AdminDataTable";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { brandService } from "@/services/brand.service";
import { categoryService } from "@/services/category.service";
import { productLineService } from "@/services/productLine.service";
import type { SortOrder } from "@/types/admin-table.type";
import type { Brand } from "@/types/brand.type";
import type { Category } from "@/types/category.type";
import type { ProductLine, ProductLineSortBy } from "@/types/product-line.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const columns: AdminColumn<ProductLine>[] = [
    {
        key: "line_name",
        title: "Dòng sản phẩm",
        sortable: true,
        render: (line) => (
            <div>
                <p className="font-medium">{line.line_name}</p>
                <p className="text-xs text-muted-foreground">{line.slug}</p>
            </div>
        ),
    },
    {
        key: "brands",
        title: "Thương hiệu",
        render: (line) => line.brands?.brand_name || "-",
    },
    {
        key: "categories",
        title: "Danh mục",
        render: (line) => line.categories?.category_name || "-",
    },
    {
        key: "display_order",
        title: "Thứ tự",
        sortable: true,
    },
    {
        key: "is_active",
        title: "Trạng thái",
        render: (line) => (
            <Badge variant={line.is_active ? "default" : "outline"}>
                {line.is_active ? "Đang bật" : "Đang tắt"}
            </Badge>
        ),
    },
    {
        key: "products",
        title: "Sản phẩm",
        render: (line) => line._count?.products ?? 0,
    },
];

export default function AdminProductLinesPage() {
    const [productLines, setProductLines] = useState<ProductLine[]>([]);
    const [selectedLine, setSelectedLine] = useState<ProductLine | null>(null);
    const [deleteLine, setDeleteLine] = useState<ProductLine | null>(null);
    const [openForm, setOpenForm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [loading, setLoading] = useState(true);

    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brandId, setBrandId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [isActive, setIsActive] = useState("all");

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<ProductLineSortBy>("line_name");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [totalPages, setTotalPages] = useState(1);

    async function fetchOptions() {
        try {
            const [brandData, categoryData] = await Promise.all([
                brandService.getAll({
                    page: 1,
                    limit: 1000,
                    search: "",
                    sortBy: "brand_name",
                    sortOrder: "asc",
                }),
                categoryService.getAll({
                    page: 1,
                    limit: 1000,
                    search: "",
                    sortBy: "category_name",
                    sortOrder: "asc",
                }),
            ]);

            setBrands(brandData?.brands ?? []);
            setCategories(categoryData?.categories ?? []);
        } catch(error) {
            toast.error(getErrorMessage(error));
        }
    }

    async function fetchProductLines() {
        try {
            setLoading(true);

            const data = await productLineService.getAll({
                page,
                limit,
                search,
                sortBy,
                sortOrder,
                brandId: brandId || undefined,
                categoryId: categoryId || undefined,
                isActive: isActive === "all" ? undefined : isActive === "true",
            });

            setProductLines(data?.productLines ?? []);
            setTotalPages(data?.meta.pagination.totalPages ?? 1);
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchOptions();
    }, []);

    useEffect(() => {
        setLoading(true);
        const timer = window.setTimeout(() => {
            fetchProductLines();
        }, 300);

        return () => window.clearTimeout(timer);
    }, [page, search, sortBy, sortOrder, brandId, categoryId, isActive]);

    function handleSortChange(nextSortBy: string) {
        if(!["line_name", "display_order", "created_at"].includes(nextSortBy)) return;

        if(sortBy === nextSortBy) {
            setSortOrder((current) => current === "asc" ? "desc" : "asc");
            return;
        }

        setSortBy(nextSortBy as ProductLineSortBy);
        setSortOrder("asc");
    }

    function handleAdd() {
        setSelectedLine(null);
        setOpenForm(true);
    }

    function handleEdit(line: ProductLine) {
        setSelectedLine(line);
        setOpenForm(true);
    }

    function handleDelete(line: ProductLine) {
        setDeleteLine(line);
    }

    async function handleConfirmDelete() {
        if(!deleteLine) return;

        try {
            setDeleting(true);
            await productLineService.remove(deleteLine.line_id);
            toast.success("Xóa dòng sản phẩm thành công.");
            setDeleteLine(null);
            fetchProductLines();
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    }

    function resetFilters() {
        setBrandId("");
        setCategoryId("");
        setIsActive("all");
        setSearch("");
        setPage(1);
    }

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

    const filters = (
        <div className="grid gap-3 rounded-md border bg-background p-4 md:grid-cols-3">
            <div className="space-y-2">
                <label className="text-sm font-medium">Thương hiệu</label>
                <Select
                    value={brandId || "all"}
                    onValueChange={(value) => {
                        setBrandId(value === "all" ? "" : value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả thương hiệu</SelectItem>
                        {brands.map((brand) => (
                            <SelectItem key={brand.brand_id} value={brand.brand_id}>
                                {brand.brand_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Danh mục</label>
                <Select
                    value={categoryId || "all"}
                    onValueChange={(value) => {
                        setCategoryId(value === "all" ? "" : value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả danh mục</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category.category_id} value={category.category_id}>
                                {category.category_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select
                    value={isActive}
                    onValueChange={(value) => {
                        setIsActive(value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="true">Đang bật</SelectItem>
                        <SelectItem value="false">Đang tắt</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

    return (
        <>
            <AdminDataTable
                title="Quản lý dòng sản phẩm"
                description="Thêm, sửa, xóa, tìm kiếm và lọc dòng sản phẩm theo thương hiệu hoặc danh mục."
                items={productLines}
                columns={columns}
                idKey="line_id"
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
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ProductLineFormDialog
                open={openForm}
                productLine={selectedLine}
                onOpenChange={setOpenForm}
                onSuccess={fetchProductLines}
            />

            <ConfirmDeleteDialog
                open={Boolean(deleteLine)}
                loading={deleting}
                title="Xóa dòng sản phẩm"
                description={`Bạn có chắc muốn xóa dòng sản phẩm "${deleteLine?.line_name}" không?`}
                onOpenChange={(open) => {
                    if(!open) setDeleteLine(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
