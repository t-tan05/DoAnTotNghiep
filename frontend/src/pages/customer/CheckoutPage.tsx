import PageLoading from "@/components/common/PageLoading";
import SpinnerButton from "@/components/common/SpinnerButton";
import AddressFormModal from "@/components/profile/address/AddressFormModal";
import { Button } from "@/components/ui/button";
import { addressService } from "@/services/address.service";
import { cartService } from "@/services/cart.service";
import { orderService } from "@/services/order.service";
import type { Address } from "@/types/address.type";
import type { CartItem } from "@/types/cart.type";
import type { PaymentMethod } from "@/types/order.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Check, Edit2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const formatPrice = (value: number | string) => {
    return Number(value).toLocaleString("vi-VN") + "Đ";
};

const BUY_NOW_STORAGE_KEY = "checkout:buy-now";

type BuyNowCheckoutItem = {
    variantId: string;
    productId: string;
    quantity: number;
    price: number | string;
    name: string;
    sku?: string;
    imageUrl?: string;
    attributes?: string;
};

type CheckoutSummaryItem = {
    id: string;
    productId: string;
    variantId: string;
    name: string;
    sku?: string | null;
    attributes?: string;
    imageUrl?: string;
    quantity: number;
    price: number | string;
};

function readBuyNowItem() {
    try {
        const raw = sessionStorage.getItem(BUY_NOW_STORAGE_KEY);
        return raw ? JSON.parse(raw) as BuyNowCheckoutItem : null;
    } catch {
        return null;
    }
}

function formatAddress(address: Address) {
    return `${address.street}, ${address.ward}, ${address.district}, ${address.province}`;
}

function getCartItemName(item: CartItem) {
    return item.product_variants.variant_name || item.product_variants.products.product_name;
}

function getCartItemImage(item: CartItem) {
    const variant = item.product_variants;
    const defaultImage = variant.product_images?.find((image) => image.is_default);

    return variant.image_url || defaultImage?.image_url || variant.product_images?.[0]?.image_url || "";
}

function getCartItemAttributes(item: CartItem) {
    return item.product_variants.variant_attribute_values
        ?.map((row) => row.attribute_values.value)
        .filter(Boolean)
        .join(", ");
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const isBuyNow = searchParams.get("mode") === "buy-now";

    const [items, setItems] = useState<CartItem[]>([]);
    const [buyNowItem, setBuyNowItem] = useState<BuyNowCheckoutItem | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
    const [orderNote, setOrderNote] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    async function fetchData(preferredAddressId?: string) {
        try{
            setLoading(true);

            const addressRes = await addressService.getAddresses();
            const cartData = isBuyNow ? null : await cartService.getMyCart();

            const stateItem = (location.state as { buyNowItem?: BuyNowCheckoutItem } | null)?.buyNowItem;
            const cartItems = cartData?.cart?.carts_items ?? [];
            const addressList: Address[] = addressRes.data.data?.addresses ?? [];

            setItems(cartItems);
            setBuyNowItem(isBuyNow ? stateItem ?? readBuyNowItem() : null);
            setAddresses(addressList);

            const defaultAddress = addressList.find((item) => item.is_default);
            const preferredAddress = preferredAddressId
                ? addressList.find((item) => item.address_id === preferredAddressId)
                : null;

            setSelectedAddressId(preferredAddress?.address_id || defaultAddress?.address_id || addressList[0]?.address_id || "");
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const summaryItems = useMemo<CheckoutSummaryItem[]>(() => {
        if(isBuyNow) {
            if(!buyNowItem) return [];

            return [{
                id: buyNowItem.variantId,
                productId: buyNowItem.productId,
                variantId: buyNowItem.variantId,
                name: buyNowItem.name,
                sku: buyNowItem.sku,
                attributes: buyNowItem.attributes,
                imageUrl: buyNowItem.imageUrl,
                quantity: buyNowItem.quantity,
                price: buyNowItem.price,
            }];
        }

        return items.map((item) => ({
            id: item.cart_item_id,
            productId: item.product_variants.products.product_id,
            variantId: item.product_variants.variant_id,
            name: getCartItemName(item),
            sku: item.product_variants.sku,
            attributes: getCartItemAttributes(item),
            imageUrl: getCartItemImage(item),
            quantity: item.quantity,
            price: item.price_at_add,
        }));
    }, [buyNowItem, isBuyNow, items]);

    const totalPrice = useMemo(() => {
        return summaryItems.reduce((sum, item) => {
            return sum + Number(item.price) * item.quantity;
        }, 0);
    }, [summaryItems]);

    const shippingFee = totalPrice >= 5_000_000 ? 0 : 40_000;
    const grandTotal = totalPrice + shippingFee;

    const hasAddress = addresses.length > 0;

    function openCreateAddressModal() {
        setEditingAddress(null);
        setAddressModalOpen(true);
    }

    function openEditAddressModal(address: Address) {
        setEditingAddress(address);
        setAddressModalOpen(true);
    }

    function closeAddressModal() {
        setAddressModalOpen(false);
        setEditingAddress(null);
    }

    async function handleAddressSuccess() {
        await fetchData(editingAddress?.address_id);
    }

    async function handleCheckout() {
        if(!selectedAddressId) {
            toast.error("Vui lòng thêm địa chỉ nhận hàng.");
            return;
        }

        if(isBuyNow && !buyNowItem) {
            toast.error("Không tìm thấy danh sách mua ngay.");
            return;
        }

        try {
            setSubmitting(true);

            const data = isBuyNow && buyNowItem
                ? await orderService.buyNow({
                    variantId: buyNowItem.variantId,
                    quantity: buyNowItem.quantity,
                    addressId: selectedAddressId,
                    paymentMethod,
                    note: orderNote.trim() || undefined,
                })
                : await orderService.checkout({
                    addressId: selectedAddressId,
                    paymentMethod,
                    note: orderNote.trim() || undefined,
                });

            if(paymentMethod === "VNPAY" && data?.paymentUrl) {
                window.location.href = data.paymentUrl;
                return;
            }

            toast.success("Đặt hàng thành công.");
            if(isBuyNow) {
                sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
            }

            navigate("/account/orders");
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setSubmitting(false);
        }
    }

    if(loading) return <PageLoading text="Đang tải trang thanh toán..."/>;

    if(summaryItems.length === 0) {
        return (
            <section className="mx-auto max-w-6xl px-4 py-10">
                <div className="rounded-lg border bg-background p-8 text-center">
                    <h1 className="text-2xl font-semibold">Giỏ hàng trống</h1>
                    <Button asChild className="mt-5 h-12 cursor-pointer">
                        <Link to="/cart">Quay lại giỏ hàng</Link>
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-semibold">Thanh toán</h1>
                <p className="mt-1 text-muted-foreground">
                    Kiểm tra thông tin nhận hàng và phương thức thanh toán.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    <section className="rounded-lg border bg-background p-5">
                        <h2 className="text-xl font-semibold">Thông tin nhận hàng</h2>

                        {hasAddress ? (
                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                {addresses.map((address) => {
                                    const selected = address.address_id === selectedAddressId;

                                    return (
                                        <div
                                            key={address.address_id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setSelectedAddressId(address.address_id)}
                                            onKeyDown={(event) => {
                                                if(event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    setSelectedAddressId(address.address_id);
                                                }
                                            }}
                                            className={[
                                                "relative min-h-[120px] rounded-lg border bg-white p-4 text-left transition hover:border-blue-700 cursor-pointer",
                                                selected ? "border-blue-700 ring-1 ring-blue-700" : "border-gray-200",
                                            ].join(" ")}
                                        >
                                            {selected && (
                                                <>
                                                    <span className="absolute right-0 top-0 h-0 w-0 rounded-tr-lg border-l-[42px] border-t-[42px] border-l-transparent border-t-blue-700" />
                                                    <Check className="absolute right-1 top-1 size-4 text-white" />
                                                </>
                                            )}

                                            <div className="flex items-center gap-2 pr-9 font-semibold">
                                                <span>{address.receiver_name}</span>
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        openEditAddressModal(address);
                                                    }}
                                                    className="rounded-full cursor-pointer p-1 text-muted-foreground transition hover:bg-blue-50 hover:text-blue-700"
                                                    aria-label={`Sửa địa chỉ của ${address.receiver_name}`}
                                                >
                                                    <Edit2 className="size-4" />
                                                </button>
                                            </div>

                                            <p className="mt-1 text-sm">{address.phone_number}</p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {formatAddress(address)}
                                            </p>

                                        </div>
                                    );
                                })}

                                <button
                                    type="button"
                                    onClick={openCreateAddressModal}
                                    className="flex min-h-[120px] flex-col cursor-pointer items-center justify-center rounded-lg border border-dashed bg-white text-muted-foreground hover:border-blue-700 hover:text-blue-700"
                                >
                                    <Plus className="mb-2 size-7" />
                                    <span>Thêm địa chỉ</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={openCreateAddressModal}
                                className="mt-5 flex min-h-[130px] w-full flex-col cursor-pointer items-center justify-center rounded-lg border border-dashed bg-white text-muted-foreground hover:border-blue-700 hover:text-blue-700"
                            >
                                <Plus className="mb-2 size-8" />
                                <span>Thêm địa chỉ nhận hàng</span>
                            </button>
                        )}
                    </section>

                    <section className="rounded-lg border bg-background p-5">
                        <h2 className="text-lg font-semibold">Ghi chú cho đơn hàng</h2>
                        <textarea
                            value={orderNote}
                            onChange={(event) => setOrderNote(event.target.value)}
                            maxLength={500}
                            placeholder="Nhập thông tin ghi chú cho nhà bán hàng"
                            className="mt-4 min-h-24 w-full resize-y rounded-md border bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                        />
                        <div className="mt-1 text-right text-xs text-muted-foreground">
                            {orderNote.length}/500
                        </div>
                    </section>
                    <section className="rounded-lg border bg-background p-5">
                        <h2 className="text-xl font-semibold">Phương thức thanh toán</h2>

                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("COD")}
                                className={[
                                    "rounded-lg border p-4 text-left cursor-pointer",
                                    paymentMethod === "COD" ? "border-blue-700 ring-1 ring-blue-700" : "",
                                ].join(" ")}
                            >
                                <p className="font-semibold">Thanh toán khi nhận hàng</p>
                                <p className="mt-1 text-sm text-muted-foreground">COD</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod("VNPAY")}
                                className={[
                                    "rounded-lg border p-4 text-left cursor-pointer",
                                    paymentMethod === "VNPAY" ? "border-blue-700 ring-1 ring-blue-700" : "",
                                ].join(" ")}
                            >
                                <p className="font-semibold">Thanh toán VNPay</p>
                                <p className="mt-1 text-sm text-muted-foreground">Thẻ ATM, QR, ví điện tử</p>
                            </button>
                        </div>
                    </section>
                </div>

                <aside className="h-fit rounded-lg bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold">Thông tin đơn hàng</h2>
                        <Link
                            to={isBuyNow && buyNowItem?.productId
                                ? `/products/${buyNowItem.productId}?variantId=${buyNowItem.variantId}`
                                : "/cart"
                            }
                            className="shrink-0 text-sm font-medium text-blue-700 hover:underline"
                        >
                            Chỉnh sửa
                        </Link>
                    </div>

                    <div className="mt-4 max-h-[360px] space-y-4 overflow-y-auto pr-1">
                        {summaryItems.map((item) => {
                            const productLink = `/products/${item.productId}?variantId=${item.variantId}`;

                            return (
                                <div key={item.id} className="flex gap-3">
                                    <Link
                                        to={productLink}
                                        className="flex size-20 shrink-0 items-center justify-center rounded-md border bg-white p-1 transition hover:border-blue-700"
                                        aria-label={`Xem chi tiết ${item.name}`}
                                    >
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Không có ảnh</span>
                                        )}
                                    </Link>

                                    <div className="min-w-0 flex-1 text-sm">
                                        <p className="line-clamp-2 font-medium text-gray-900">
                                            <Link to={productLink} className="hover:text-blue-700 hover:underline">
                                                {item.name}
                                            </Link>
                                        </p>
                                        {item.sku && (
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                SKU: {item.sku}
                                            </p>
                                        )}
                                        {item.attributes && (
                                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                                {item.attributes}
                                            </p>
                                        )}
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Số lượng: {item.quantity}
                                        </p>
                                        <p className="mt-1 font-semibold text-gray-900">
                                            {formatPrice(item.price)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-5 space-y-3 border-t pt-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tạm tính</span>
                            <span className="font-semibold">{formatPrice(totalPrice)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Phí vận chuyển</span>
                            <span className="font-semibold">
                                {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                            </span>
                        </div>

                        <div className="flex justify-between text-base font-semibold">
                            <span>Thành tiền</span>
                            <span className="text-xl text-red-600">{formatPrice(grandTotal)}</span>
                        </div>
                    </div>

                    <SpinnerButton
                        type="button"
                        loading={submitting}
                        loadingText="Đang đặt hàng..."
                        onClick={handleCheckout}
                        disabled={!selectedAddressId}
                        className="mt-5 h-14 w-full cursor-pointer bg-blue-700 text-white hover:bg-blue-800"
                    >
                        THANH TOÁN
                    </SpinnerButton>
                </aside>
            </div>

            <AddressFormModal
                open={addressModalOpen}
                mode={editingAddress ? "edit" : "create"}
                address={editingAddress}
                initialDefault={!hasAddress}
                onClose={closeAddressModal}
                onSuccess={handleAddressSuccess}
            />
        </section>
    );
}
