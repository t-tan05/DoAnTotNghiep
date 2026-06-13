import { Button } from "@/components/ui/button";
import type { AdminProductVariant } from "@/types/productVariant.type"

type Props = {
    variants: AdminProductVariant[];
    onEdit: (variant: AdminProductVariant) => void;
    onDelete: (variant: AdminProductVariant) => void;
};

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

                return (
                    <div 
                        key={variant.variant_id}
                        className="flex flex-col gap-3 rounded-lg border bg-background p-4 md:flex-row md:items-center md:justify-between"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            {imageUrl ? (
                                <img 
                                    src={imageUrl}
                                    alt={variant.sku}
                                    className="h-14 w-14 rounded-md object-cover"
                                />
                            ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                                    No image
                                </div>
                            )}

                            <div className="min-w-0">
                                <p className="font-medium">{variant.sku}</p>
                                <p className="text-sm text-muted-foreground">
                                    {Number(variant.price).toLocaleString("vi-VN")}đ / Tồn: {variant.quantity_in_stock}
                                </p>
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