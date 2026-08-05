import PageLoading from "@/components/common/PageLoading";
import { Button } from "@/components/ui/button";
import { cartService } from "@/services/cart.service";
import { wishlistService } from "@/services/wishlist.service";
import type { CartItem } from "@/types/cart.type";
import type { WishlistItem } from "@/types/wishlist.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Heart, HeartOff, Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const formatPrice = (value: number | string) => {
    return Number(value).toLocaleString("vi-VN") + "đ";
};

function getImage(item: WishlistItem) {
    const variant = item.product_variants;

    return (
        variant.image_url ||
        variant.product_images?.find((image) => image.is_default)?.image_url ||
        variant.product_images?.[0]?.image_url ||
        ""
    );
}

function getName(item: WishlistItem) {
    return item.product_variants.variant_name || item.product_variants.products.product_name;
}

function getAttributes(item: WishlistItem) {
    return item.product_variants.variant_attribute_values
        ?.map((row) => `${row.attribute_values.product_attributes.attribute_name}: ${row.attribute_values.value}`)
        .join(" / ");
}

function getProductLink(item: WishlistItem) {
    return `/products/${item.product_variants.products.product_id}?variantId=${item.product_variants.variant_id}`;
}

function getAvailableQuantity(item: WishlistItem) {
    const variant = item.product_variants;
    return Math.max(0, Number(variant.quantity_in_stock) - Number(variant.reserved_quantity));
}

export default function WishlistPage() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState("");
    const [cartUpdatingId, setCartUpdatingId] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    async function loadWishlists(nextPage = page) {
        try {
            setLoading(true);

            const [wishlistData, cartData] = await Promise.all([
                wishlistService.getMyWishlists(nextPage, 8),
                cartService.getMyCart(),
            ]);

            setItems(wishlistData.wishlists);
            setTotalPages(wishlistData.meta.pagination.totalPages);
            setCartItems(cartData?.cart?.carts_items ?? []);
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadWishlists(page);
    }, [page]);

    async function handleRemove(variantId: string) {
        try {
            setRemovingId(variantId);

            await wishlistService.remove(variantId);

            toast.success("Đã bỏ khỏi danh sách yêu thích.");

            if(items.length === 1 && page > 1) {
                setPage((current) => current - 1);
                return;
            }

            await loadWishlists(page);
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setRemovingId("");
        }
    }

    async function handleAddToCart(item: WishlistItem) {
        const variantId = item.product_variants.variant_id;

        try {
            setCartUpdatingId(variantId);

            await cartService.addItem({
                variantId,
                quantity: 1,
            });

            toast.success("Đã thêm sản phẩm vào giỏ hàng.");
            await loadWishlists(page);
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setCartUpdatingId("");
        }
    }

    async function handleUpdateCartQuantity(item: WishlistItem, cartItem: CartItem, nextQuantity: number) {
        if(nextQuantity < 1) return;

        const availableQuantity = getAvailableQuantity(item);

        if(nextQuantity > availableQuantity) {
            toast.error(`Chỉ còn ${availableQuantity} sản phẩm có thể mua.`);
            return;
        }

        try {
            setCartUpdatingId(item.product_variants.variant_id);

            await cartService.updateItem(cartItem.cart_item_id, {
                quantity: nextQuantity,
            });

            setCartItems((current) =>
                current.map((row) =>
                    row.cart_item_id === cartItem.cart_item_id
                        ? {
                            ...row,
                            quantity: nextQuantity,
                        }
                        : row
                )
            );
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setCartUpdatingId("");
        }
    }

    if(loading) return <PageLoading text="Đang tải sản phẩm yêu thích..." />;

    return (
        <section className="min-w-0">
            <div>
                <h1 className="text-2xl font-bold">Sản phẩm yêu thích</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Danh sách các sản phẩm bạn đã lưu lại.
                </p>
            </div>

            {items.length === 0 ? (
                <div className="mt-5 flex min-h-[360px] flex-col items-center justify-center rounded-xl border bg-white p-8 text-center">
                    <HeartOff className="size-14 text-muted-foreground" />
                    <p className="mt-4 font-medium">Bạn chưa có sản phẩm yêu thích nào</p>
                    <Button asChild className="mt-5 h-12 cursor-pointer">
                        <Link to="/c/laptop">Xem sản phẩm</Link>
                    </Button>
                </div>
            ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => {
                        const imageUrl = getImage(item);
                        const name = getName(item);
                        const attributes = getAttributes(item);
                        const link = getProductLink(item);
                        const variant = item.product_variants;
                        const isRemoving = removingId === variant.variant_id;
                        const cartItem = cartItems.find((row) => row.variant_id === variant.variant_id);
                        const availableQuantity = getAvailableQuantity(item);
                        const isOutOfStock = availableQuantity <= 0;
                        const isCartUpdating = cartUpdatingId === variant.variant_id;

                        return (
                            <article
                                key={item.wishlist_id}
                                className="relative rounded-lg border bg-white p-4 transition hover:border-blue-700 hover:shadow-sm"
                            >
                                <button
                                    type="button"
                                    disabled={isRemoving}
                                    onClick={() => handleRemove(variant.variant_id)}
                                    aria-label="Bỏ khỏi danh sách yêu thích"
                                    className="absolute right-4 top-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-blue-700 shadow-sm ring-1 ring-border transition hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Heart className="size-5 fill-blue-700" />
                                </button>

                                <Link to={link} className="block">
                                    <div className="aspect-square rounded-md bg-muted p-3">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={name}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                                Không có ảnh
                                            </div>
                                        )}
                                    </div>

                                    <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">
                                        {variant.products.brands?.brand_name || "-"}
                                    </p>

                                    <h2 className="mt-1 line-clamp-2 font-semibold hover:text-blue-700">
                                        {name}
                                    </h2>

                                    {attributes && (
                                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                            {attributes}
                                        </p>
                                    )}

                                    <p className="mt-3 text-lg font-bold text-blue-700">
                                        {formatPrice(variant.price)}
                                    </p>
                                </Link>

                                {cartItem ? (
                                    <div className="mt-4 flex h-11 items-center justify-between overflow-hidden rounded-md border border-blue-700 text-blue-700">
                                        <button
                                            type="button"
                                            disabled={cartItem.quantity <= 1 || isCartUpdating}
                                            onClick={() => handleUpdateCartQuantity(item, cartItem, cartItem.quantity - 1)}
                                            className="flex h-full w-14 cursor-pointer items-center justify-center transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            aria-label="Giảm số lượng"
                                        >
                                            <Minus className="size-4" />
                                        </button>

                                        <span className="min-w-10 text-center font-semibold">
                                            {cartItem.quantity}
                                        </span>

                                        <button
                                            type="button"
                                            disabled={cartItem.quantity >= availableQuantity || isCartUpdating}
                                            onClick={() => handleUpdateCartQuantity(item, cartItem, cartItem.quantity + 1)}
                                            className="flex h-full w-14 cursor-pointer items-center justify-center transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            aria-label="Tăng số lượng"
                                        >
                                            <Plus className="size-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isOutOfStock || isCartUpdating}
                                        onClick={() => handleAddToCart(item)}
                                        className="mt-4 h-11 w-full cursor-pointer border-blue-700 text-blue-700 hover:bg-blue-50 hover:text-blue-700 disabled:pointer-events-auto disabled:cursor-not-allowed"
                                    >
                                        <ShoppingCart className="mr-2 size-4" />
                                        {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
                                    </Button>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-5 flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={page <= 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        className="cursor-pointer disabled:cursor-not-allowed"
                    >
                        Trước
                    </Button>

                    <span className="text-sm text-muted-foreground">
                        Trang {page} / {totalPages}
                    </span>

                    <Button
                        type="button"
                        variant="outline"
                        disabled={page >= totalPages}
                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                        className="cursor-pointer disabled:cursor-not-allowed"
                    >
                        Sau
                    </Button>
                </div>
            )}
        </section>
    );
}
