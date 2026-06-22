import PageLoading from "@/components/common/PageLoading";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/order.service";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { CheckCircle2, CircleX, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

type ResultState = {
    status: "success" | "failed" | "pending";
    title: string;
    message: string;
};

export default function PaymentReturnPage() {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<ResultState | null>(null);

    useEffect(() => {
        async function verifyPayment() {
            try {
                const data = await orderService.handleVnpayReturn(location.search);
                const paymentStatus = data?.paymentStatus;

                if(["PAID", "REFUNDED_AFTER_EXPIRED", "REFUNDED_AMOUNT_MISMATCH", "REFUNDED"].includes(String(paymentStatus))) {
                    setResult({
                        status: paymentStatus === "PAID" ? "success" : "failed",
                        title: paymentStatus === "PAID" ? "Thanh toán thành công": "Đơn đã được hoàn tiền",
                        message: data?.message || "Kết quả thanh toán đã được hệ thống ghi nhận.",
                    });
                    return;
                }

                setResult({
                    status: "failed",
                    title: "Thanh toán thất bại",
                    message: data?.message || "Giao dịch chưa được thanh toán thành công.",
                });
            }catch(error) {
                setResult({
                    status: "failed",
                    title: "Không thể xác nhận thanh toán",
                    message: getErrorMessage(error),
                });
            }finally{
                setLoading(false);
            }
        }

        verifyPayment();
    }, [location.search]);

    if(loading) return <PageLoading text="Đang xác nhận kết quả thanh toán..." />;

    const success = result?.status === "success";

    return (
        <section className="mx-auto flex max-w-3xl px-4 py-12">
            <div className="w-full rounded-lg border bg-background p-8 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
                    {success ? (
                        <CheckCircle2 className="size-10 text-green-600" />
                    ) : (
                        <CircleX className="size-10 text-red-600" />
                    )}
                </div>

                <h1 className="mt-5 text-2xl font-semibold">{result?.title}</h1>
                <p className="mt-2 text-muted-foreground">{result?.message}</p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button asChild className="h-12 cursor-pointer">
                        <Link to="/account/orders">Xem đơn hàng</Link>
                    </Button>

                    {!success && (
                        <Button asChild variant="outline" className="h-12 cursor-pointer">
                            <Link to="/cart">
                                <RefreshCw className="mr-2 size-4" />
                                Quay lại giỏ hàng
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}