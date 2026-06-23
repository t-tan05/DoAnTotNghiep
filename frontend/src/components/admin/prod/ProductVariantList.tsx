import { Button } from "@/components/ui/button";
import type { AdminProductVariant } from "@/types/productVariant.type"

type Props = {
    variants: AdminProductVariant[];
    onEdit: (variant: AdminProductVariant) => void;
    onDelete: (variant: AdminProductVariant) => void;
};

function formatPrice(value: string | number) {
    return `${Number(value).toLocaleString("vi-VN")}đ`;
}

export default function ProductVariantList({
    variants,
    onEdit,
    onDelete,
}: Props) {
    if(variants.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Sản phẩm chưa có biến thể.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {variants.map((variant) => {
                const imageUrl = variant.image_url || variant.product_images?.[0]?.image_url;
                const hasDiscount = variant.discount_price !== null && variant.discount_price !== undefined;
                const displayName = variant.variant_name || variant.sku;

                return (
                    <div 
                        key={variant.variant_id}
                        className="flex flex-col gap-3 rounded-lg border bg-background p-4 md:flex-row md:items-center md:justify-between"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            {imageUrl ? (
                                <img 
                                    src={imageUrl}
                                    alt={displayName}
                                    className="h-14 w-14 rounded-md object-cover"
                                />
                            ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                                    No image
                                </div>
                            )}

                            <div className="min-w-0">
                                <p className="font-medium">{displayName}</p>
                                {variant.variant_name && (
                                    <p className="text-xs text-muted-foreground">
                                        SKU: {variant.sku}
                                    </p>
                                )}
                                <div className="text-sm">
                                    {hasDiscount ? (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-muted-foreground line-through">
                                                {formatPrice(variant.original_price ?? variant.price)}
                                            </span>
                                            <span className="font-semibold text-red-600">
                                                {formatPrice(variant.discount_price as number)}
                                            </span>
                                            <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                                                {variant.active_promotion?.promotion_name}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            {formatPrice(variant.price)}
                                        </span>
                                    )}

                                    <p className="text-muted-foreground">
                                        Tồn: {variant.quantity_in_stock}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant={"outline"} size={"sm"} onClick={() => onEdit(variant)}>
                                Chỉnh sửa
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => onDelete(variant)}>
                                Xóa
                            </Button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
