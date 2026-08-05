import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cmsService } from "@/services/cms.service";
import { productService } from "@/services/product.service";
import type { CmsSectionItem, CmsSectionItemPayload } from "@/types/cms.type";
import type { AdminProduct } from "@/types/product.type";
import type { AdminProductVariant } from "@/types/productVariant.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Check, ChevronLeft, ChevronRight, ImageIcon, PackageSearch, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    sectionId: string;
    item?: CmsSectionItem | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

function formatCurrency(value: number | string) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function getProductImage(product: AdminProduct) {
    return (
        product.product_images?.find((image) => image.is_default)?.image_url ||
        product.product_images?.[0]?.image_url ||
        product.product_variants?.[0]?.image_url ||
        product.product_variants?.[0]?.product_images?.find((image) => image.is_default)?.image_url ||
        product.product_variants?.[0]?.product_images?.[0]?.image_url ||
        ""
    );
}

function getVariantImage(variant: AdminProductVariant, product: AdminProduct) {
    return (
        variant.image_url ||
        variant.product_images?.find((image) => image.is_default)?.image_url ||
        variant.product_images?.[0]?.image_url ||
        getProductImage(product)
    );
}

function getVariantLabel(product: AdminProduct, variant: AdminProductVariant) {
    return variant.variant_name?.trim() || product.product_name;
}

function buildProductLink(productId: string) {
    return `/products/${productId}`;
}

function buildVariantLink(productId: string, variantId: string) {
    return `/products/${productId}?variantId=${variantId}`;
}

type ProductTarget = {
    key: string;
    title: string;
    imageUrl: string;
    href: string;
    productId: string;
    variantId: string;
};

function EmptyImage({ className = "h-14 w-14" }: { className?: string }) {
    return (
        <div className={`flex shrink-0 items-center justify-center rounded-md border bg-muted ${className}`}>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </div>
    );
}

export default function CmsSectionItemFormDialog({
    open,
    sectionId,
    item,
    onOpenChange,
    onSuccess,
}: Props) {
    const isEdit = Boolean(item);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        title: "",
        subtitle: "",
        imageUrl: "",
        href: "",
        productId: "",
        variantId: "",
        blogId: "",
        sortOrder: "0",
        isActive: "true",
    });

    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [productPage, setProductPage] = useState(1);
    const [productTotalPages, setProductTotalPages] = useState(1);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [selectedTargets, setSelectedTargets] = useState<ProductTarget[]>([]);

    const selectedTargetText = useMemo(() => {
        if(!isEdit && selectedTargets.length > 0) return `Đã chọn ${selectedTargets.length} item`;
        if(form.variantId) return `Đã chọn variant ${form.variantId.slice(0, 8)}...`;
        if(form.productId) return `Đã chọn product ${form.productId.slice(0, 8)}...`;
        if(form.blogId) return `Đã chọn blog ${form.blogId.slice(0, 8)}...`;
        return "Chưa chọn nội dung";
    }, [form.blogId, form.productId, form.variantId, isEdit, selectedTargets.length]);

    useEffect(() => {
        if(!open) return;

        setForm({
            title: item?.title ?? "",
            subtitle: item?.subtitle ?? "",
            imageUrl: item?.image_url ?? "",
            href: item?.href ?? "",
            productId: item?.product_id ?? "",
            variantId: item?.variant_id ?? "",
            blogId: item?.blog_id ?? "",
            sortOrder: String(item?.sort_order ?? 0),
            isActive: item?.is_active === false ? "false" : "true",
        });
        setError("");
        setProductPage(1);
        setSelectedTargets([]);
    }, [open, item]);

    useEffect(() => {
        if(!open) return;

        const timer = window.setTimeout(async() => {
            try {
                setLoadingProducts(true);
                const data = await productService.getAll({
                    page: productPage,
                    limit: 6,
                    search: productSearch.trim() || undefined,
                    sortBy: "product_name",
                    sortOrder: "asc",
                });

                setProducts(data?.products ?? []);
                setProductTotalPages(data?.meta?.pagination?.totalPages ?? 1);
            } catch(error) {
                toast.error(getErrorMessage(error));
            } finally {
                setLoadingProducts(false);
            }
        }, 300);

        return () => window.clearTimeout(timer);
    }, [open, productPage, productSearch]);

    function updateField(name: keyof typeof form, value: string) {
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function selectProduct(product: AdminProduct) {
        const imageUrl = getProductImage(product);

        setForm((current) => ({
            ...current,
            title: product.product_name,
            imageUrl: imageUrl || current.imageUrl,
            href: buildProductLink(product.product_id),
            productId: product.product_id,
            variantId: "",
            blogId: "",
        }));
    }

    function selectVariant(product: AdminProduct, variant: AdminProductVariant) {
        const imageUrl = getVariantImage(variant, product);
        const title = getVariantLabel(product, variant);

        setForm((current) => ({
            ...current,
            title,
            imageUrl: imageUrl || current.imageUrl,
            href: buildVariantLink(product.product_id, variant.variant_id),
            productId: product.product_id,
            variantId: variant.variant_id,
            blogId: "",
        }));
    }

    function getProductTarget(product: AdminProduct): ProductTarget {
        return {
            key: `product:${product.product_id}`,
            title: product.product_name,
            imageUrl: getProductImage(product),
            href: buildProductLink(product.product_id),
            productId: product.product_id,
            variantId: "",
        };
    }

    function getVariantTarget(product: AdminProduct, variant: AdminProductVariant): ProductTarget {
        return {
            key: `variant:${variant.variant_id}`,
            title: getVariantLabel(product, variant),
            imageUrl: getVariantImage(variant, product),
            href: buildVariantLink(product.product_id, variant.variant_id),
            productId: product.product_id,
            variantId: variant.variant_id,
        };
    }

    function toggleTarget(target: ProductTarget) {
        setSelectedTargets((current) => current.some((item) => item.key === target.key)
            ? current.filter((item) => item.key !== target.key)
            : [...current, target]
        );
    }

    function isTargetSelected(key: string) {
        return selectedTargets.some((target) => target.key === key);
    }

    function clearPickedTarget() {
        setForm((current) => ({
            ...current,
            productId: "",
            variantId: "",
            blogId: "",
        }));
        setSelectedTargets([]);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        try {
            setLoading(true);

            const payload: CmsSectionItemPayload = {
                title: form.title.trim() || null,
                subtitle: form.subtitle.trim() || null,
                imageUrl: form.imageUrl.trim() || null,
                href: form.href.trim() || null,
                productId: form.productId.trim() || null,
                variantId: form.variantId.trim() || null,
                blogId: form.blogId.trim() || null,
                sortOrder: Number(form.sortOrder || 0),
                isActive: form.isActive === "true",
            };

            if(isEdit && item) {
                await cmsService.updateSectionItem(item.item_id, payload);
                toast.success("Cập nhật item thành công.");
            } else if(selectedTargets.length > 0) {
                const baseSortOrder = Number(form.sortOrder || 0);

                await cmsService.createSectionItems(sectionId, {
                    items: selectedTargets.map((target, index) => ({
                        title: target.title,
                        subtitle: form.subtitle.trim() || null,
                        imageUrl: target.imageUrl || null,
                        href: target.href,
                        productId: target.productId,
                        variantId: target.variantId || null,
                        blogId: null,
                        sortOrder: baseSortOrder + index,
                        isActive: form.isActive === "true",
                    })),
                });

                toast.success(`Tạo ${selectedTargets.length} item thành công.`);
            } else {
                await cmsService.createSectionItem(sectionId, payload);
                toast.success("Tạo item thành công.");
            }

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
            <DialogContent className="max-h-[92vh] w-[calc(100vw-2rem)] overflow-hidden p-0 sm:!max-w-6xl">
                <DialogHeader className="border-b px-5 py-4">
                    <DialogTitle>{isEdit ? "Cập nhật item" : "Thêm item"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex max-h-[calc(92vh-72px)] flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto p-5">
                        <FormError message={error} />

                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(520px,1.35fr)]">
                            <div className="space-y-4">
                                <div className="rounded-lg border p-4">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold">Thông tin thẻ/mục</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Đây là nội dung của từng thẻ trong khu vực. Ví dụ: thẻ sản phẩm, thẻ banner hoặc nút lối tắt.
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="shrink-0">
                                            {selectedTargetText}
                                        </Badge>
                                    </div>

                                    {form.imageUrl ? (
                                        <div className="mb-4 flex items-center gap-3 rounded-md border bg-muted/30 p-3">
                                            <img src={form.imageUrl} alt={form.title || "CMS item"} className="h-20 w-20 rounded-md border bg-white object-contain" />
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{form.title || "Chưa có tiêu đề"}</p>
                                                <p className="line-clamp-2 text-sm text-muted-foreground">{form.href || "Chưa có link"}</p>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Tiêu đề hiển thị trên thẻ</Label>
                                            <Input value={form.title} onChange={(event) => updateField("title", event.target.value)} />
                                            
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Link</Label>
                                            <Input value={form.href} onChange={(event) => updateField("href", event.target.value)} placeholder="/c/laptop-gaming" />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Ảnh</Label>
                                            <Input value={form.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} placeholder="https://..." />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Thứ tự</Label>
                                            <Input type="number" value={form.sortOrder} onChange={(event) => updateField("sortOrder", event.target.value)} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Trạng thái</Label>
                                            <Select value={form.isActive} onValueChange={(value) => updateField("isActive", value)}>
                                                <SelectTrigger className="w-full cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Đang bật</SelectItem>
                                                    <SelectItem value="false">Đang tắt</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Mô tả phụ</Label>
                                            <Textarea value={form.subtitle} onChange={(event) => updateField("subtitle", event.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold">ID đã chọn</h3>
                                            <p className="text-sm text-muted-foreground">Dành cho trường hợp cần nhập tay hoặc kiểm tra lại.</p>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={clearPickedTarget}>
                                            Xóa chọn
                                        </Button>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Product ID</Label>
                                            <Input value={form.productId} onChange={(event) => updateField("productId", event.target.value)} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Variant ID</Label>
                                            <Input value={form.variantId} onChange={(event) => updateField("variantId", event.target.value)} />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Blog ID</Label>
                                            <Input value={form.blogId} onChange={(event) => updateField("blogId", event.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border p-4">
                                <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                    <div>
                                        <h3 className="font-semibold">Chọn sản phẩm / biến thể cho thẻ</h3>
                                    </div>
                                    <div className="relative w-full xl:w-80">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={productSearch}
                                            onChange={(event) => {
                                                setProductSearch(event.target.value);
                                                setProductPage(1);
                                            }}
                                            className="pl-9"
                                            placeholder="Tìm iPhone, laptop, SKU..."
                                        />
                                    </div>
                                </div>

                                <div className="max-h-[58vh] space-y-3 overflow-y-auto pr-1">
                                    {loadingProducts ? (
                                        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                                            Đang tải sản phẩm...
                                        </div>
                                    ) : products.length === 0 ? (
                                        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                                            <PackageSearch className="mx-auto mb-2 h-6 w-6" />
                                            Không tìm thấy sản phẩm phù hợp.
                                        </div>
                                    ) : products.map((product) => {
                                        const productImage = getProductImage(product);
                                        const productTarget = getProductTarget(product);

                                        return (
                                            <div key={product.product_id} className="rounded-lg border bg-white p-3">
                                                <div className="flex gap-3">
                                                    {productImage ? (
                                                        <img src={productImage} alt={product.product_name} className="h-16 w-16 shrink-0 rounded-md border object-contain" />
                                                    ) : (
                                                        <EmptyImage className="h-16 w-16" />
                                                    )}

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
                                                            <div className="min-w-0">
                                                                <p className="line-clamp-2 font-medium leading-snug">{product.product_name}</p>
                                                                <p className="mt-1 text-sm text-muted-foreground">
                                                                    {product.brands?.brand_name || "-"} / {product.categories?.category_name || "-"}
                                                                </p>
                                                                <p className="mt-1 break-all text-xs text-muted-foreground">Product ID: {product.product_id}</p>
                                                            </div>

                                                            {isEdit ? (
                                                                <Button
                                                                    type="button"
                                                                    variant={form.productId === product.product_id && !form.variantId ? "default" : "outline"}
                                                                    size="sm"
                                                                    className="shrink-0 cursor-pointer"
                                                                    onClick={() => selectProduct(product)}
                                                                >
                                                                    <Check className="mr-2 h-4 w-4" />
                                                                    Chọn sản phẩm chung
                                                                </Button>
                                                            ) : (
                                                                <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
                                                                    <Checkbox
                                                                        checked={isTargetSelected(productTarget.key)}
                                                                        onCheckedChange={() => toggleTarget(productTarget)}
                                                                    />
                                                                    Thêm sản phẩm chung
                                                                </label>
                                                            )}
                                                        </div>

                                                        {product.product_variants?.length ? (
                                                            <div className="mt-3 overflow-hidden rounded-md border">
                                                                <div className="grid grid-cols-[36px_64px_minmax(0,1fr)_120px_108px] bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
                                                                    <span></span>
                                                                    <span>Ảnh</span>
                                                                    <span>Biến thể</span>
                                                                    <span>SKU</span>
                                                                    <span className="text-right">Giá</span>
                                                                </div>
                                                                <div className="divide-y">
                                                                    {product.product_variants.map((variant) => {
                                                                        const variantImage = getVariantImage(variant, product);
                                                                        const variantTarget = getVariantTarget(product, variant);
                                                                        const selected = form.variantId === variant.variant_id;
                                                                        const targetSelected = isTargetSelected(variantTarget.key);

                                                                        return (
                                                                            <div
                                                                                key={variant.variant_id}
                                                                                role="button"
                                                                                tabIndex={0}
                                                                                onClick={() => isEdit ? selectVariant(product, variant) : toggleTarget(variantTarget)}
                                                                                onKeyDown={(event) => {
                                                                                    if(event.key === "Enter" || event.key === " ") {
                                                                                        event.preventDefault();
                                                                                        isEdit ? selectVariant(product, variant) : toggleTarget(variantTarget);
                                                                                    }
                                                                                }}
                                                                                className={`grid w-full cursor-pointer grid-cols-[36px_64px_minmax(0,1fr)_120px_108px] items-center gap-3 px-3 py-2 text-left transition hover:bg-primary/5 ${selected || targetSelected ? "bg-primary/10" : ""}`}
                                                                            >
                                                                                <span onClick={(event) => event.stopPropagation()}>
                                                                                    {!isEdit ? (
                                                                                        <Checkbox
                                                                                            checked={targetSelected}
                                                                                            onCheckedChange={() => toggleTarget(variantTarget)}
                                                                                        />
                                                                                    ) : selected ? (
                                                                                        <Check className="h-4 w-4 text-primary" />
                                                                                    ) : null}
                                                                                </span>
                                                                                {variantImage ? (
                                                                                    <img src={variantImage} alt={getVariantLabel(product, variant)} className="h-11 w-11 rounded-md border object-contain" />
                                                                                ) : (
                                                                                    <EmptyImage className="h-11 w-11" />
                                                                                )}
                                                                                <span className="min-w-0">
                                                                                    <span className="block truncate text-sm font-medium">{getVariantLabel(product, variant)}</span>
                                                                                    <span className="block break-all text-xs text-muted-foreground">{variant.variant_id}</span>
                                                                                </span>
                                                                                <span className="truncate text-xs text-muted-foreground">{variant.sku}</span>
                                                                                <span className="text-right text-sm font-semibold text-primary">{formatCurrency(variant.price)}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 flex items-center justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={productPage <= 1 || loadingProducts}
                                        onClick={() => setProductPage((current) => Math.max(current - 1, 1))}
                                    >
                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                        Trước
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Trang {productPage} / {Math.max(productTotalPages, 1)}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={productPage >= productTotalPages || loadingProducts}
                                        onClick={() => setProductPage((current) => current + 1)}
                                    >
                                        Sau
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="shrink-0">
                        <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <SpinnerButton type="submit" loading={loading} loadingText="Đang lưu...">
                            {isEdit ? "Cập nhật" : "Tạo mới"}
                        </SpinnerButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
