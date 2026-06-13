import { Button } from "@/components/ui/button";
import { productImageService } from "@/services/productImage.service";
import type { AdminProductVariant } from "@/types/productVariant.type"
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
    variant: AdminProductVariant | null;
    onChanged: () => Promise<void> | void;
};

export default function ProductVariantImageGallery({ variant, onChanged }: Props) {
    const [loadingImageId, setLoadingImageId] = useState<number | null> (null);

    if(!variant) return null;

    async function handleSetDefault(imageId: number) {
        try{
            setLoadingImageId(imageId);
            await productImageService.setDefault(imageId);
            toast.success("Đặt ảnh mặc định thành công.");
            await onChanged();
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setLoadingImageId(null);
        }
    }

    async function handleRemove(imageId: number) {
        try {
            setLoadingImageId(imageId);
            await productImageService.remove(imageId);
            toast.success("Xóa ảnh thành công.");
            await onChanged();
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setLoadingImageId(null);
        }
    }

    return (
        <div className="rounded-lg border bg-background p-5">
            <h2 className="text-lg font-semibold">Ảnh hiện tại</h2>

            {variant.product_images.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Biến thể chưa có ảnh.
                </div>
            ) : (
                <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {variant.product_images.map((image) => (
                        <div key={image.image_id} className="overflow-hidden rounded-lg border bg-background">
                            <div className="relative">
                                <img
                                    src={image.image_url}
                                    alt="Ảnh biến thể"
                                    className="aspect-square w-full object-cover"
                                />

                                {image.is_default && (
                                    <span className="absolute left-2 top-2 rounded bg-black px-2 py-1 text-xs text-white shadow-sm">
                                        Mặc định
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 p-2">
                                {!image.is_default && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={loadingImageId === image.image_id}
                                        onClick={() => handleSetDefault(image.image_id)}
                                        className="flex-1 cursor-pointer min-w-[80px]"
                                    >
                                        <Check className="mr-1 h-4 w-4 shrink-0" />
                                        <span className="truncate">Mặc định</span>
                                    </Button>
                                )}

                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    disabled={loadingImageId === image.image_id}
                                    onClick={() => handleRemove(image.image_id)}
                                    className="cursor-pointer"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}