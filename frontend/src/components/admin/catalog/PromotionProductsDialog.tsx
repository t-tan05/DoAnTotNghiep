import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { productService } from "@/services/product.service";
import { promotionService } from "@/services/promotion.service";
import type { AdminProduct } from "@/types/product.type";
import type { Promotion } from "@/types/promotion.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Check, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    promotion: Promotion | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

export default function PromotionProductsDialog({
    open,
    promotion,
    onOpenChange,
    onSuccess,
}: Props) {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !promotion) return;

        setSelectedIds(promotion.products_promotions.map((item) => item.product_id));
        setSearch("");
        setPage(1);
        setError("");
    }, [open, promotion]);

    async function fetchProducts() {
        if (!open) return;

        try {
            setLoadingProducts(true);

            const data = await productService.getAll({
                page,
                limit: 10,
                search,
                sortBy: "product_name",
                sortOrder: "asc",
            });

            setProducts(data?.products ?? []);
            setTotalPages(data?.meta.pagination.totalPages ?? 1);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoadingProducts(false);
        }
    }

    useEffect(() => {
        if (!open) return;

        const timer = window.setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => window.clearTimeout(timer);
    }, [open, page, search]);

    function toggleProduct(productId: string) {
        setSelectedIds((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId],
        );
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!promotion) return;

        try {
            setLoading(true);
            setError("");

            await promotionService.updateProducts(promotion.promotion_id, {
                productIds: selectedIds,
            });

            toast.success("Cập nhật sản phẩm khuyến mãi thành công.");
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] overflow-y-auto sm:!max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Gán sản phẩm: {promotion?.promotion_name}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormError message={error} />

                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Tìm sản phẩm theo tên, thương hiệu, danh mục..."
                            className="pl-9"
                        />
                    </div>

                    <div className="rounded-lg border">
                        <div className="flex items-center justify-between border-b px-4 py-3 text-sm">
                            <span>Đã chọn {selectedIds.length} sản phẩm</span>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={selectedIds.length === 0}
                                onClick={() => {
                                    setSelectedIds([]);
                                    setError("");
                                }}
                            >
                                Bỏ chọn tất cả
                            </Button>
                        </div>

                        <div className="max-h-[420px] divide-y overflow-y-auto">
                            {loadingProducts ? (
                                <div className="p-6 text-center text-sm text-muted-foreground">
                                    Đang tải sản phẩm...
                                </div>
                            ) : null}

                            {!loadingProducts && products.length === 0 ? (
                                <div className="p-6 text-center text-sm text-muted-foreground">
                                    Không có sản phẩm phù hợp.
                                </div>
                            ) : null}

                            {!loadingProducts && products.map((product) => {
                                const checked = selectedIds.includes(product.product_id);
                                const imageUrl =
                                    product.product_variants?.[0]?.image_url
                                    || product.product_variants?.[0]?.product_images?.[0]?.image_url;

                                return (
                                    <div
                                        key={product.product_id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => toggleProduct(product.product_id)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                toggleProduct(product.product_id);
                                            }
                                        }}
                                        aria-pressed={checked}
                                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-muted/60"
                                    >
                                        <span
                                            className={[
                                                "flex size-4 shrink-0 items-center justify-center rounded border",
                                                checked
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-input bg-background",
                                            ].join(" ")}
                                            aria-hidden="true"
                                        >
                                            {checked ? <Check className="h-3 w-3" /> : null}
                                        </span>

                                        <div className="h-14 w-14 overflow-hidden rounded border bg-muted">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={product.product_name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">{product.product_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {product.brands.brand_name} / {product.categories.category_name}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={page <= 1 || loadingProducts}
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                            >
                                Trước
                            </Button>

                            <span>Trang {page} / {totalPages}</span>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages || loadingProducts}
                                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                            >
                                Sau
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>

                        <SpinnerButton type="submit" loading={loading} loadingText="Đang lưu...">
                            Lưu sản phẩm
                        </SpinnerButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
