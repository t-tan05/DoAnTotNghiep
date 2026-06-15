import ProductBasicInfoForm from "@/components/admin/prod/ProductBasicInfoForm";
import ProductVariantList from "@/components/admin/prod/ProductVariantList";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import FormError from "@/components/common/FormError";
import PageLoading from "@/components/common/PageLoading";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/product.service";
import { productVariantService } from "@/services/productVariant.service";
import type { AdminProduct } from "@/types/product.type";
import type { AdminProductVariant } from "@/types/productVariant.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function AdminProductDetailPage() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState<AdminProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [deleteVariant, setDeleteVariant] = useState<AdminProductVariant | null>(null);
    const [deleting, setDeleting] = useState(false);

    async function loadProduct(options?: { silent?: boolean }) {
        if (!productId) return;

        try {
            if (!options?.silent) setLoading(true);
            setError("");

            const data = await productService.getById(productId);
            setProduct(data?.product ?? null);
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            if (!options?.silent) setLoading(false);
        }
    }

    useEffect(() => {
        loadProduct();

        const intervalId = window.setInterval(() => {
            loadProduct({ silent: true });
        }, 60_000);

        return () => window.clearInterval(intervalId);
    }, [productId]);

    async function handleConfirmDeleteVariant() {
        if (!deleteVariant) return;

        try {
            setDeleting(true);
            await productVariantService.remove(deleteVariant.variant_id);
            toast.success("Xóa biến thể thành công.");
            setDeleteVariant(null);
            loadProduct();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    }

    if (loading) return <PageLoading text="Đang tải sản phẩm..." />;
    if (error) return <FormError message={error} />;
    if (!product) return <p>Không tìm thấy sản phẩm.</p>;

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <Button
                        variant="ghost"
                        className="mb-2 px-0 cursor-pointer"
                        onClick={() => navigate("/admin/products")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>

                    <h1 className="text-2xl font-semibold tracking-tight">{product.product_name}</h1>
                    <p className="text-sm text-muted-foreground">
                        {product.brands.brand_name} / {product.categories.category_name}
                    </p>
                </div>

                <Button
                    className="h-12 cursor-pointer"
                    onClick={() => navigate(`/admin/products/${product.product_id}/variants/new`)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm biến thể
                </Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <ProductBasicInfoForm product={product} onSuccess={() => loadProduct()} />

                <div className="rounded-lg border bg-background p-5">
                    <h2 className="text-lg font-semibold">Tóm tắt</h2>

                    <div className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Số biến thể</span>
                            <span className="font-medium">{product.product_variants.length}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tổng tồn kho</span>
                            <span className="font-medium">
                                {product.product_variants.reduce(
                                    (total, variant) => total + variant.quantity_in_stock,
                                    0,
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-background p-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Biến thể</h2>
                </div>

                <div className="mt-4 space-y-3">
                    {product.product_variants.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sản phẩm chưa có biến thể.</p>
                    ) : (
                        <ProductVariantList
                            variants={product.product_variants}
                            onEdit={(variant) =>
                                navigate(`/admin/products/${product.product_id}/variants/${variant.variant_id}/edit`)
                            }
                            onDelete={setDeleteVariant}
                        />
                    )}
                </div>
            </div>

            <ConfirmDeleteDialog
                open={Boolean(deleteVariant)}
                loading={deleting}
                title="Xóa biến thể"
                description={`Bạn có chắc muốn xóa biến thể "${deleteVariant?.sku}" không?`}
                onOpenChange={(open) => {
                    if (!open) setDeleteVariant(null);
                }}
                onConfirm={handleConfirmDeleteVariant}
            />
        </section>
    );
}
