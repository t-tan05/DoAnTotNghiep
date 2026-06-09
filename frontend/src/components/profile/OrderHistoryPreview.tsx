import { Package } from "lucide-react";

export default function OrderHistoryPreview() {
    return (
        <section className="rounded-xl border bg-white p-5 md:p-6">
            <h2 className="text-xl font-bold">Lịch sử đơn hàng</h2>

            <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                <Package className="size-10 text-muted-foreground" />

                <p className="mt-3 font-medium">Chưa có đơn hàng</p>
            </div>
        </section>
    )
}