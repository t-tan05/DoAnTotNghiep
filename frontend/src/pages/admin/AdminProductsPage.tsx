import ProductCreateDialog from "@/components/admin/catalog/ProductCreateDialog";
import ProductFilterBar from "@/components/admin/prod/ProductFilterBar";
import type { AdminColumn } from "@/components/admin/table/AdminDataTable";
import AdminDataTable from "@/components/admin/table/AdminDataTable";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { brandService } from "@/services/brand.service";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import { productLineService } from "@/services/productLine.service";
import type { SortOrder } from "@/types/admin-table.type";
import type { Brand } from "@/types/brand.type";
import type { Category } from "@/types/category.type";
import type { ProductLine } from "@/types/product-line.type";
import type { AdminProduct, ProductSortBy } from "@/types/product.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const columns: AdminColumn<AdminProduct>[] = [
    {
        key: "image",
        title: "Ảnh",
        render: (product) => {
            const firstVariant = product.product_variants?.[0];
            const imageUrl = firstVariant?.image_url || firstVariant?.product_images?.[0]?.image_url;

            return imageUrl ? (
                <img src={imageUrl} alt={product.product_name} className="h-12 w-12 rounded-md object-cover"/>
            ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                    Không có ảnh
                </div>
            );
        },
    },
    {
        key: "product_name",
        title: "Tên sản phẩm",
        sortable: true,
    },
    {
        key: "brand",
        title: "Thương hiệu",
        render: (product) => product.brands?.brand_name || "-"
    },
    {
        key: "category",
        title: "Danh mục",
        render: (product) => product.categories?.category_name || "-"
    },
    {
        key: "variants",
        title: "Số biến thể",
        render: (product) => product.product_variants.length,
    },
    {
        key: "stock",
        title: "Tồn kho",
        render: (product) => product.product_variants.reduce((total, variant) => total + variant.quantity_in_stock, 0)
    },
    {
        key: "warranty_period",
        title: "Bảo hành",
        sortable: true,
        render: (product) => `${product.warranty_period} tháng`,
    },
    {
        key: "created_at",
        title: "Ngày tạo",
        sortable: true,
        render: (product) => product.created_at ? new Date(product.created_at).toLocaleDateString("vi-VN") : "-",
    },
];

export default function AdminProductsPage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [productLines, setProductLines] = useState<ProductLine[]>([]);
    const [openCreate, setOpenCreate] = useState(false);
    const [deleteProduct, setDeleteProduct] = useState<AdminProduct | null>(null);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [brandId, setBrandId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [lineId, setLineId] = useState("");
    const [sortBy, setSortBy] = useState<ProductSortBy>("created_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    async function loadOptions() {
        try {
            const [brandData, categoryData, lineData] = await Promise.all([
                brandService.getAll({ page: 1, limit: 100, search: "", sortBy: "brand_name", sortOrder: "asc" }),
                categoryService.getAll({ page: 1, limit: 100, search: "", sortBy: "category_name", sortOrder: "asc" }),
                productLineService.getAll({ page: 1, limit: 1000, search: "", sortBy: "display_order", sortOrder: "asc", isActive: true }),
            ]);

            setBrands(brandData?.brands ?? []);
            setCategories(categoryData?.categories ?? []);
            setProductLines(lineData?.productLines ?? []);
        } catch(error) {
            toast.error(getErrorMessage(error));
        }
    }

    async function fetchProducts() {
        try {
            setLoading(true);

            const data = await productService.getAll({
                page,
                limit,
                search,
                brandId: brandId || undefined,
                categoryId: categoryId || undefined,
                lineId: lineId || undefined,
                sortBy,
                sortOrder,
            });

            setProducts(data?.products ?? []);
            setTotalPages(data?.meta.pagination.totalPages ?? 1);
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOptions();
    }, []);

    useEffect(() => {
        setLoading(true);

        const timer = window.setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => window.clearTimeout(timer);
    }, [page, search, brandId, categoryId, lineId, sortBy, sortOrder]);

    function handleSortChange(nextSortBy: string) {
        if(!["product_name", "created_at", "warranty_period"].includes(nextSortBy)) return;

        if(sortBy === nextSortBy) {
            setSortOrder((current) => current === "asc" ? "desc" : "asc");
            return;
        }

        setSortBy(nextSortBy as ProductSortBy);
        setSortOrder(nextSortBy === "created_at" ? "desc" : "asc");
    }

    async function handleConfirmDelete() {
        if(!deleteProduct) return;

        try {
            setDeleting(true);
            await productService.remove(deleteProduct.product_id);
            toast.success("Xóa sản phẩm thành công.");
            setDeleteProduct(null);
            fetchProducts();
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    }

    const filteredProductLines = productLines.filter((line) => {
        if(brandId && line.brand_id !== brandId) return false;
        if(categoryId && line.category_id !== categoryId) return false;

        return true;
    });

    return (
        <>
            <div className="space-y-4">
                <ProductFilterBar
                    brandId={brandId}
                    categoryId={categoryId}
                    lineId={lineId}
                    brands={brands}
                    categories={categories}
                    productLines={filteredProductLines}
                    onBrandChange={(value) => {
                        setBrandId(value);
                        setLineId("");
                        setPage(1);
                    }}
                    onCategoryChange={(value) => {
                        setCategoryId(value);
                        setLineId("");
                        setPage(1);
                    }}
                    onLineChange={(value) => {
                        setLineId(value);
                        setPage(1);
                    }}
                    onClear={() => {
                        setBrandId("");
                        setCategoryId("");
                        setLineId("");
                        setPage(1);
                    }}
                />

                <AdminDataTable
                    title="Quản lý sản phẩm"
                    description="Thêm, sửa, xóa, tìm kiếm và lọc sản phẩm."
                    items={products}
                    columns={columns}
                    idKey="product_id"
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
                    onAdd={() => setOpenCreate(true)}
                    onView={(product) => navigate(`/admin/products/${product.product_id}`)}
                    onDelete={setDeleteProduct}
                />
            </div>

            <ProductCreateDialog
                open={openCreate}
                brands={brands}
                categories={categories}
                onOpenChange={setOpenCreate}
                onSuccess={(productId) => {
                    setOpenCreate(false);
                    navigate(`/admin/products/${productId}`);
                }}
            />

            <ConfirmDeleteDialog
                open={Boolean(deleteProduct)}
                loading={deleting}
                title="Xóa sản phẩm"
                description={`Bạn có chắc muốn xóa sản phẩm "${deleteProduct?.product_name}" không?`}
                onOpenChange={(open) => {
                    if(!open) setDeleteProduct(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </>
    )
}
