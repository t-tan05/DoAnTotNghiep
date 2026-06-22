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
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const formatPrice = (value: number | string) => {
    return Number(value).toLocaleString("vi-VN") + "đ";
};

function formatAddress(address: Address) {
    return `${address.street}, ${address.ward}, ${address.province}`;
}

export default function CheckoutPage() {
    const navigate = useNavigate();

    const [items, setItems] = useState<CartItem[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [addressModalOpen, setAddressModalOpen] = useState(false);

    async function fetchData() {
        try{
            setLoading(true);

            const [cartData, addressRes] = await Promise.all([
                cartService.getMyCart(),
                addressService.getAddresses(),
            ]);

            const cartItems = cartData?.cart?.carts_items ?? [];
            const addressList: Address[] = addressRes.data.data?.addresses ?? [];

            setItems(cartItems);
            setAddresses(addressList);

            const defaultAddress = addressList.find((item) => item.is_default);
            setSelectedAddressId(defaultAddress?.address_id || addressList[0]?.address_id || "");
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const totalPrice = useMemo(() => {
        return items.reduce((sum, item) => {
            return sum + Number(item.price_at_add) * item.quantity;
        }, 0);
    }, [items]);

    const selectedAddress = addresses.find((item) => item.address_id === selectedAddressId);
    const hasAddress = addresses.length > 0;

    async function handleCheckout() {
        if(!selectedAddressId) {
            toast.error("Vui lòng thêm địa chỉ nhận hàng.");
            return;
        }

        try {
            setSubmitting(true);

            const data = await orderService.checkout({
                addressId: selectedAddressId,
                paymentMethod,
            });

            if(paymentMethod === "VNPAY" && data?.paymentUrl) {
                window.location.href = data.paymentUrl;
                return;
            }

            toast.success("Đặt hàng thành công.");
            navigate("/account/orders");
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setSubmitting(false);
        }
    }

    if(loading) return <PageLoading text="Đang tải trang thanh toán..."/>;

    if(items.length === 0) {
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
                                        <button
                                            key={address.address_id}
                                            type="button"
                                            onClick={() => setSelectedAddressId(address.address_id)}
                                            className={[
                                                "relative min-h-[120px] rounded-lg border bg-white p-4 text-left transition hover:border-blue-700 cursor-pointer",
                                                selected ? "border-blue-700 ring-1 ring-blue-700" : "border-gray-200",
                                            ].join(" ")}
                                        >
                                            {selected && (
                                                <span className="absolute right-0 top-0 flex size-9 items-start justify-end overflow-hidden rounded-tr-lg bg-blue-700 text-white">
                                                    <Check className="mr-1 mt-1 size-4" />
                                                </span>
                                            )}

                                            <div className="flex items-center gap-2 font-semibold">
                                                <span>{address.receiver_name}</span>
                                                <Edit2 className="size-4 text-muted-foreground" />
                                            </div>

                                            <p className="mt-1 text-sm">{address.phone_number}</p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {formatAddress(address)}
                                            </p>

                                        </button>
                                    );
                                })}

                                <button
                                    type="button"
                                    onClick={() => setAddressModalOpen(true)}
                                    className="flex min-h-[120px] flex-col cursor-pointer items-center justify-center rounded-lg border border-dashed bg-white text-muted-foreground hover:border-blue-700 hover:text-blue-700"
                                >
                                    <Plus className="mb-2 size-7" />
                                    <span>Thêm địa chỉ</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setAddressModalOpen(true)}
                                className="mt-5 flex min-h-[130px] w-full flex-col cursor-pointer items-center justify-center rounded-lg border border-dashed bg-white text-muted-foreground hover:border-blue-700 hover:text-blue-700"
                            >
                                <Plus className="mb-2 size-8" />
                                <span>Thêm địa chỉ nhận hàng</span>
                            </button>
                        )}
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

                <aside className="h-fit rounded-lg border bg-background p-5">
                    <h2 className="text-xl font-semibold">Thông tin đơn hàng</h2>

                    <div className="mt-5 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span>Sản phẩm</span>
                            <span>{items.length}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Tạm tính</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Phí vận chuyển</span>
                            <span>Miễn phí</span>
                        </div>

                        <div className="flex justify-between border-t pt-3 text-base font-semibold">
                            <span>Tổng cộng</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>
                    </div>

                    {selectedAddress && (
                        <div className="mt-5 rounded-lg bg-muted p-3 text-sm">
                            <p className="font-medium">{selectedAddress.receiver_name}</p>
                            <p className="mt-1">{selectedAddress.phone_number}</p>
                            <p className="mt-1 text-muted-foreground">{formatAddress(selectedAddress)}</p>
                        </div>
                    )}

                    <SpinnerButton
                        type="button"
                        loading={submitting}
                        loadingText="Đang đặt hàng..."
                        onClick={handleCheckout}
                        disabled={!selectedAddressId}
                        className="mt-5 h-14 w-full cursor-pointer bg-blue-700 text-white hover:bg-blue-800"
                    >
                        Đặt hàng
                    </SpinnerButton>
                </aside>
            </div>

            <AddressFormModal
                open={addressModalOpen}
                mode="create"
                initialDefault={!hasAddress}
                onClose={() => setAddressModalOpen(false)}
                onSuccess={fetchData}
            />
        </section>
    );
}