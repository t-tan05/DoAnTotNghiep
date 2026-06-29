import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OrderPaymentStatus, OrderStatus, PaymentMethod } from "@/types/order.type";

type Props = {
    status: OrderStatus | "";
    paymentStatus: OrderPaymentStatus | "";
    paymentMethod: PaymentMethod | "";
    fromDate: string;
    toDate: string;
    onStatusChange: (value: OrderStatus | "") => void;
    onPaymentStatusChange: (value: OrderPaymentStatus | "") => void;
    onPaymentMethodChange: (value: PaymentMethod | "") => void;
    onFromDateChange: (value: string) => void;
    onToDateChange: (value: string) => void;
    onClear: () => void;
};

export default function OrderFilterBar({
    status,
    paymentStatus,
    paymentMethod,
    fromDate,
    toDate,
    onStatusChange,
    onPaymentStatusChange,
    onPaymentMethodChange,
    onFromDateChange,
    onToDateChange,
    onClear,
}: Props) {
    return (
        <div className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-3 xl:grid-cols-6">
            <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value as OrderStatus | "")}
                className="h-10 rounded-md border bg-background px-3 text-sm cursor-pointer"
            >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="SHIPPED">Đang giao</option>
                <option value="DELIVERY_FAILED">Giao thất bại</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="RETURNED">Đã trả hàng</option>
            </select>

            <select
                value={paymentStatus}
                onChange={(e) => onPaymentStatusChange(e.target.value as OrderPaymentStatus | "")}
                className="h-10 rounded-md border bg-background px-3 text-sm cursor-pointer"
            >
                <option value="">Tất cả thanh toán</option>
                <option value="UNPAID">Chưa thanh toán</option>
                <option value="PENDING">Chờ thanh toán</option>
                <option value="PAID">Đã thanh toán</option>
                <option value="FAILED">Thất bại</option>
                <option value="REFUND_PENDING">Đang hoàn tiền</option>
                <option value="REFUNDED">Đã hoàn tiền</option>
                <option value="REFUND_FAILED">Hoàn tiền thất bại</option>
            </select>

            <select
                value={paymentMethod}
                onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod | "")}
                className="h-10 rounded-md border bg-background px-3 text-sm cursor-pointer"
            >
                <option value="">Tất cả phương thức</option>
                <option value="COD">COD</option>
                <option value="VNPAY">VNPay</option>
                <option value="MOMO">MoMo</option>
                <option value="ZALOPAY">ZaloPay</option>
                <option value="BANK_TRANSFER">Chuyển khoản</option>
            </select>

            <Input type="date" value={fromDate} onChange={(e) => onFromDateChange(e.target.value)} className="cursor-pointer"/>
            <Input type="date" value={toDate} onChange={(e) => onToDateChange(e.target.value)} className="cursor-pointer"/>

            <Button type="button" variant="outline" onClick={onClear} className="cursor-pointer">
                Xóa lọc
            </Button>
        </div>
    );
}