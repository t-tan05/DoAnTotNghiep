import PageLoading from "@/components/common/PageLoading";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import { cartService } from "@/services/cart.service";
import type { CartItem } from "@/types/cart.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const formatPrice = (value: number | string) => {
    return Number(value).toLocaleString("vi-VN") + "đ";
};

function getVariantImage(item: CartItem) {
    return (
        item.product_variants.image_url ||
        item.product_variants.product_images?.find((image) => image.is_default)?.image_url ||
        item.product_variants.product_images?.[0]?.image_url ||
        ""
    );
}

function getVariantAttributes(item: CartItem) {
    return item.product_variants.variant_attribute_values
        ?.map((row) => `${row.attribute_values.product_attributes.attribute_name}: ${row.attribute_values.value}`)
        .join(" / ");
}

function getProductDetailLink(item: CartItem) {
    return `/products/${item.product_variants.products.product_id}?variantId=${item.product_variants.variant_id}`;
}

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState("");
    const [clearing, setClearing] = useState(false);

    async function fetchCart(options?: { silent?: boolean }) {
        try {
            if (!options?.silent) {
                setLoading(true);
            }

            const data = await cartService.getMyCart();
            setItems(data?.cart?.carts_items ?? []);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            if (!options?.silent) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        fetchCart();
    }, []);

    const totalPrice = useMemo(() => {
        return items.reduce((sum, item) => {
            return sum + Number(item.price_at_add) * item.quantity;
        }, 0);
    }, [items]);

    const shippingFee = useMemo(() => {
        return totalPrice >= 5000000 ? 0 : 40000;
    }, [totalPrice]);

    const grandTotal = useMemo(() => {
        return totalPrice + shippingFee;
    }, [totalPrice, shippingFee]);

    async function updateQuantity(item: CartItem, nextQuantity: number) {
        if (nextQuantity < 1) return;

        const previousItems = items;

        setItems((currentItems) =>
            currentItems.map((currentItem) =>
                currentItem.cart_item_id === item.cart_item_id
                    ? { ...currentItem, quantity: nextQuantity }
                    : currentItem
            )
        );

        try {
            setUpdatingId(item.cart_item_id);

            await cartService.updateItem(item.cart_item_id, {
                quantity: nextQuantity,
            });
        } catch (error) {
            setItems(previousItems);
            toast.error(getErrorMessage(error));
        } finally {
            setUpdatingId("");
        }
    }

    async function removeItem(item: CartItem) {
        const previousItems = items;

        setItems((currentItems) =>
            currentItems.filter((currentItem) => currentItem.cart_item_id !== item.cart_item_id)
        );

        try {
            setUpdatingId(item.cart_item_id);
            await cartService.removeItem(item.cart_item_id);
            toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
        } catch (error) {
            setItems(previousItems);
            toast.error(getErrorMessage(error));
        } finally {
            setUpdatingId("");
        }
    }

    async function clearCart() {
        const previousItems = items;

        try {
            setClearing(true);
            setItems([]);

            await cartService.clearCart();
            toast.success("Đã xóa giỏ hàng.");
        } catch (error) {
            setItems(previousItems);
            toast.error(getErrorMessage(error));
        } finally {
            setClearing(false);
        }
    }

    if (loading) return <PageLoading text="Đang tải giỏ hàng..." />;

    if (items.length === 0) {
        return (
            <section className="mx-auto max-w-6xl px-4 py-10">
                <div className="rounded-lg border bg-background p-8 text-center">
                    <h1 className="text-2xl font-semibold">Giỏ hàng trống</h1>
                    <p className="mt-2 text-muted-foreground">
                        Bạn chưa có sản phẩm nào trong giỏ hàng.
                    </p>
                    <Button asChild className="mt-5 cursor-pointer h-14">
                        <Link to="/c/laptop">Tiếp tục mua hàng</Link>
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">Giỏ hàng</h1>
                    <p className="mt-1 text-muted-foreground">
                        {items.length} sản phẩm trong giỏ hàng.
                    </p>
                </div>

                <SpinnerButton
                    type="button"
                    variant="outline"
                    loading={clearing}
                    loadingText="Đang xóa..."
                    onClick={clearCart}
                    className="cursor-pointer h-12"
                >
                    Xóa giỏ hàng
                </SpinnerButton>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                    {items.map((item) => {
                        const imageUrl = getVariantImage(item);
                        const attributes = getVariantAttributes(item);
                        const isUpdating = updatingId === item.cart_item_id;
                        const displayName = item.product_variants.variant_name || item.product_variants.products.product_name;

                        return (
                            <article
                                key={item.cart_item_id}
                                className="grid gap-4 rounded-lg border bg-background p-4 sm:grid-cols-[120px_1fr_auto]"
                            >
                                <Link
                                    to={getProductDetailLink(item)}
                                    className="overflow-hidden rounded-lg border bg-muted transition hover:border-blue-700"
                                    aria-label={`Xem chi tiết ${displayName}`}
                                >
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={displayName}
                                            className="aspect-square w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex aspect-square items-center justify-center text-sm text-muted-foreground">
                                            No image
                                        </div>
                                    )}
                                </Link>

                                <div className="min-w-0">
                                    <h2 className="font-semibold">
                                        <Link
                                            to={getProductDetailLink(item)}
                                            className="hover:text-blue-700 hover:underline"
                                        >
                                            {displayName}
                                        </Link>
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        SKU: {item.product_variants.sku || "-"}
                                    </p>

                                    {attributes && (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {attributes}
                                        </p>
                                    )}

                                    <p className="mt-3 font-semibold text-primary">
                                        {formatPrice(item.price_at_add)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:justify-between">
                                    <div className="flex items-center rounded-lg border">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className={Number(item.quantity) <= 1 ? "disabled:!pointer-events-auto disabled:!cursor-not-allowed opacity-50" : "cursor-pointer"}
                                            disabled={isUpdating || item.quantity <= 1}
                                            onClick={() => updateQuantity(item, item.quantity - 1)}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>

                                        <span className="w-10 text-center font-medium">
                                            {item.quantity}
                                        </span>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={isUpdating}
                                            onClick={() => updateQuantity(item, item.quantity + 1)}
                                            className="cursor-pointer"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        disabled={isUpdating}
                                        onClick={() => removeItem(item)}
                                        className="cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </article>
                        );
                    })}
                </div>

                <aside className="h-fit rounded-lg border bg-background p-5">
                    <h2 className="text-xl font-semibold">Tóm tắt đơn hàng</h2>

                    <div className="mt-5 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span>Tạm tính</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Phí vận chuyển</span>
                            <span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
                        </div>

                        <div className="border-t pt-3 flex justify-between text-base font-semibold">
                            <span>Tổng cộng</span>
                            <span>{formatPrice(grandTotal)}</span>
                        </div>
                    </div>

                    <Button asChild className="mt-5 w-full h-14 cursor-pointer bg-blue-700 text-white hover:bg-blue-800">
                        <Link to="/checkout">TIẾP TỤC</Link>
                    </Button>
                </aside>
            </div>
        </section>
    );
}
