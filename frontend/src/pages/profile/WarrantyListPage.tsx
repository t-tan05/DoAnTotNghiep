import PageLoading from "@/components/common/PageLoading";
import WarrantyStatusBadge from "@/components/profile/WarrantyStatusBadge";
import { Button } from "@/components/ui/button";
import { warrantyService } from "@/services/warranty.service";
import type { Warranty } from "@/types/warranty.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { LifeBuoy, PackageSearch, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

function formatDate(value?: string | null) {
    if(!value) return "-";
    return new Date(value).toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

function getWarrantyImage(warranty: Warranty) {
    const variant = warranty.devices.product_variants;

    return (
        variant.image_url ||
        variant.product_images?.find((image) => image.is_default)?.image_url ||
        variant.product_images?.[0]?.image_url ||
        ""
    );
}

function getProductDetailLink(warranty: Warranty) {
    const variant = warranty.devices.product_variants;
    return `/products/${variant.products.product_id}?variantId=${variant.variant_id}`;
}

export default function WarrantyListPage() {
    const [warranties, setWarranties] = useState<Warranty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    async function loadWarranties(nextPage = page) {
        try {
            setLoading(true);
            setError("");

            const data = await warrantyService.getMine(nextPage, 5);
            setWarranties(data.warranties);
            setTotalPages(data.meta.pagination.totalPages);
        } catch(error) {
            setWarranties([]);
            setError(getErrorMessage(error));
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadWarranties(page);
    }, [page]);

    return (
        <section className="min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Bảo hành của tôi</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Theo dõi yêu cầu bảo hành, lịch lấy máy và tiến độ xử lý thiết bị.
                    </p>
                </div>

                <Button asChild className="h-11 cursor-pointer">
                    <Link to="/account/warranties/new">
                        <Plus className="size-4" />
                        Tạo yêu cầu
                    </Link>
                </Button>
            </div>

            <div className="mt-5">
                {loading && <PageLoading text="Đang tải danh sách bảo hành..." />}

                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {!loading && !error && warranties.length === 0 && (
                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border bg-white p-8 text-center">
                        <div className="flex size-32 items-center justify-center rounded-full bg-muted">
                            <PackageSearch className="size-16 text-muted-foreground/60" />
                        </div>

                        <p className="mt-5 text-lg font-medium">Bạn chưa có phiếu bảo hành nào</p>
                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                            Khi thiết bị gặp lỗi, hãy tạo yêu cầu để nhân viên kiểm tra điều kiện bảo hành và hướng dẫn gửi máy.
                        </p>

                        <Button asChild className="mt-5 h-12 cursor-pointer">
                            <Link to="/account/warranties/new">Tạo yêu cầu bảo hành</Link>
                        </Button>
                    </div>
                )}

                {!loading && !error && warranties.length > 0 && (
                    <div className="space-y-4">
                        {warranties.map((warranty) => {
                            const variant = warranty.devices.product_variants;
                            const productName = variant.variant_name || variant.products.product_name;
                            const imageUrl = getWarrantyImage(warranty);

                            return (
                                <article key={warranty.warranty_id} className="overflow-hidden rounded-xl border bg-white">
                                    <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
                                        <div className="min-w-0">
                                            <p className="flex items-center gap-2 font-semibold">
                                                <LifeBuoy className="size-4 text-blue-700" />
                                                Phiếu #{warranty.warranty_code}
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Tạo lúc: {formatDate(warranty.created_at)}
                                            </p>
                                        </div>

                                        <WarrantyStatusBadge status={warranty.status} />
                                    </div>

                                    <div className="grid gap-4 p-4 sm:grid-cols-[88px_1fr_auto]">
                                        <Link
                                            to={getProductDetailLink(warranty)}
                                            className="overflow-hidden rounded-lg border bg-muted transition hover:border-blue-700"
                                            aria-label={`Xem chi tiết ${productName}`}
                                        >
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={productName} className="aspect-square w-full object-cover" />
                                            ) : (
                                                <div className="flex aspect-square items-center justify-center text-xs text-muted-foreground">
                                                    Không có ảnh
                                                </div>
                                            )}
                                        </Link>

                                        <div className="min-w-0">
                                            <h2 className="font-semibold">
                                                <Link to={getProductDetailLink(warranty)} className="hover:text-blue-700 hover:underline">
                                                    {productName}
                                                </Link>
                                            </h2>
                                            <p className="mt-1 text-sm text-muted-foreground">SKU: {variant.sku || "-"}</p>
                                            <p className="mt-1 text-sm text-muted-foreground">Serial: {warranty.devices.serial_number}</p>
                                            <p className="mt-2 line-clamp-2 text-sm">{warranty.issue_description}</p>
                                        </div>

                                        <Button asChild variant="outline" className="h-10 cursor-pointer self-start">
                                            <Link to={`/account/warranties/${warranty.warranty_id}`}>
                                                Xem chi tiết
                                            </Link>
                                        </Button>
                                    </div>
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
            </div>
        </section>
    );
}
