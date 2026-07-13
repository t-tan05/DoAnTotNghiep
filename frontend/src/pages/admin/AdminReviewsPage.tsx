import type { AdminColumn } from "@/components/admin/table/AdminDataTable";
import AdminDataTable from "@/components/admin/table/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { reviewService } from "@/services/review.service";
import type { SortOrder } from "@/types/admin-table.type";
import type { AdminReview, AdminReviewSortBy } from "@/types/review.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { RotateCcw, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

function formatDateTime(value?: string | null) {
    if(!value) return "-";

    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}

function formatRating(rating: number) {
    return (
        <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, index) => (
                <Star
                    key={index}
                    className={[
                        "h-4 w-4",
                        index < rating ? "fill-amber-400" : "text-muted-foreground/30",
                    ].join(" ")}
                />
            ))}
            <span className="ml-1 text-sm font-medium text-foreground">{rating}/5</span>
        </div>
    );
}

function shortText(value: string, maxLength = 90) {
    if(value.length <= maxLength) return value;
    return `${value.slice(0, maxLength)}...`;
}

type ReviewDetailDialogProps = {
    review: AdminReview | null;
    onOpenChange: (open: boolean) => void;
};

function ReviewDetailDialog({ review, onOpenChange }: ReviewDetailDialogProps) {
    return (
        <Dialog open={Boolean(review)} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Chi tiết đánh giá</DialogTitle>
                </DialogHeader>

                {review ? (
                    <div className="space-y-4 text-sm">
                        <div className="grid gap-3 rounded-md border bg-muted/20 p-4 md:grid-cols-2">
                            <div>
                                <p className="text-muted-foreground">Khách hàng</p>
                                <p className="font-medium">{review.users?.name || "-"}</p>
                                <p className="text-xs text-muted-foreground">{review.users?.email || "-"}</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground">Thời gian đánh giá</p>
                                <p className="font-medium">{formatDateTime(review.created_at)}</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground">Sản phẩm</p>
                                <p className="font-medium">{review.products?.product_name || "-"}</p>
                                <p className="text-xs text-muted-foreground">{review.product_id}</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground">Đơn hàng</p>
                                <p className="font-medium">#{review.order_id.slice(0, 8)}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDateTime(review.orders?.order_date)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Số sao</Label>
                            {formatRating(review.rating)}
                        </div>

                        <div className="space-y-2">
                            <Label>Nội dung đánh giá</Label>
                            <div className="whitespace-pre-line rounded-md border bg-background p-3 leading-6">
                                {review.comment}
                            </div>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<AdminReviewSortBy>("created_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [totalPages, setTotalPages] = useState(1);

    const [rating, setRating] = useState("all");
    const [productId, setProductId] = useState("");
    const [userId, setUserId] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    async function fetchReviews() {
        try {
            setLoading(true);

            const data = await reviewService.getAdmin({
                page,
                limit,
                search,
                sortBy,
                sortOrder,
                rating: rating === "all" ? undefined : Number(rating),
                productId: productId.trim() || undefined,
                userId: userId.trim() || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate ? `${toDate}T23:59:59.999` : undefined,
            });

            setReviews(data.reviews || []);
            setTotalPages(data.meta.pagination.totalPages || 1);
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        const timer = window.setTimeout(() => {
            fetchReviews();
        }, 300);

        return () => window.clearTimeout(timer);
    }, [page, search, sortBy, sortOrder, rating, productId, userId, fromDate, toDate]);

    function handleSortChange(nextSortBy: string) {
        if(!["created_at", "rating", "product_name", "customer_name"].includes(nextSortBy)) return;

        if(sortBy === nextSortBy) {
            setSortOrder((current) => current === "asc" ? "desc" : "asc");
            return;
        }

        setSortBy(nextSortBy as AdminReviewSortBy);
        setSortOrder(nextSortBy === "created_at" ? "desc" : "asc");
    }

    function resetFilters() {
        setSearch("");
        setRating("all");
        setProductId("");
        setUserId("");
        setFromDate("");
        setToDate("");
        setSortBy("created_at");
        setSortOrder("desc");
        setPage(1);
    }

    const columns = useMemo<AdminColumn<AdminReview>[]>(() => [
        {
            key: "created_at",
            title: "Thời gian",
            sortable: true,
            render: (review) => (
                <div className="min-w-[120px]">
                    <p className="font-medium">{formatDateTime(review.created_at)}</p>
                    <p className="text-xs text-muted-foreground">#{String(review.review_id)}</p>
                </div>
            ),
        },
        {
            key: "customer_name",
            title: "Khách hàng",
            sortable: true,
            render: (review) => (
                <div className="min-w-[160px]">
                    <p className="font-medium">{review.users?.name || "-"}</p>
                    <p className="text-xs text-muted-foreground">{review.users?.email || "-"}</p>
                </div>
            ),
        },
        {
            key: "product_name",
            title: "Sản phẩm",
            sortable: true,
            render: (review) => (
                <div className="max-w-[260px]">
                    {review.products?.product_id ? (
                        <Link
                            to={`/admin/products/${review.products.product_id}`}
                            className="line-clamp-2 font-medium text-blue-700 hover:underline"
                        >
                            {review.products.product_name}
                        </Link>
                    ) : (
                        <p className="line-clamp-2 font-medium">{review.products?.product_name || "-"}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{review.product_id}</p>
                </div>
            ),
        },
        {
            key: "rating",
            title: "Số sao",
            sortable: true,
            render: (review) => formatRating(review.rating),
        },
        {
            key: "comment",
            title: "Nội dung",
            render: (review) => (
                <p className="max-w-[320px] whitespace-pre-line text-sm leading-6">
                    {shortText(review.comment)}
                </p>
            ),
        },
        {
            key: "order_id",
            title: "Đơn hàng",
            render: (review) => (
                <div>
                    <p className="font-medium">#{review.order_id.slice(0, 8)}</p>
                    <Badge variant="outline" className="mt-1">
                        {review.orders?.status || "-"}
                    </Badge>
                </div>
            ),
        },
    ], []);

    const filters = (
        <div className="grid gap-3 rounded-md border bg-background p-4 md:grid-cols-5">
            <div className="space-y-2">
                <Label>Số sao</Label>
                <Select
                    value={rating}
                    onValueChange={(value) => {
                        setRating(value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="5">5 sao</SelectItem>
                        <SelectItem value="4">4 sao</SelectItem>
                        <SelectItem value="3">3 sao</SelectItem>
                        <SelectItem value="2">2 sao</SelectItem>
                        <SelectItem value="1">1 sao</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Từ ngày</Label>
                <Input
                    type="date"
                    value={fromDate}
                    onChange={(event) => {
                        setFromDate(event.target.value);
                        setPage(1);
                    }}
                />
            </div>

            <div className="space-y-2">
                <Label>Đến ngày</Label>
                <Input
                    type="date"
                    value={toDate}
                    onChange={(event) => {
                        setToDate(event.target.value);
                        setPage(1);
                    }}
                />
            </div>

            <div className="space-y-2">
                <Label>Mã sản phẩm</Label>
                <Input
                    value={productId}
                    onChange={(event) => {
                        setProductId(event.target.value);
                        setPage(1);
                    }}
                    placeholder="product_id"
                />
            </div>

            <div className="space-y-2">
                <Label>Mã khách hàng</Label>
                <Input
                    value={userId}
                    onChange={(event) => {
                        setUserId(event.target.value);
                        setPage(1);
                    }}
                    placeholder="user_id"
                />
            </div>
        </div>
    );

    const headerActions = (
        <Button
            type="button"
            variant="outline"
            onClick={resetFilters}
            className="h-12 cursor-pointer"
        >
            <RotateCcw className="mr-2 h-4 w-4" />
            Xóa lọc
        </Button>
    );

    return (
        <>
            <AdminDataTable
                title="Quản lý đánh giá"
                description="Theo dõi đánh giá sản phẩm của khách hàng: tìm kiếm, lọc theo số sao, sản phẩm, khách hàng, khoảng ngày và sắp xếp."
                items={reviews}
                columns={columns}
                idKey="review_id"
                search={search}
                page={page}
                totalPages={totalPages}
                sortBy={sortBy}
                sortOrder={sortOrder}
                loading={loading}
                headerActions={headerActions}
                filters={filters}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                onPageChange={setPage}
                onSortChange={handleSortChange}
                onView={setSelectedReview}
            />

            <ReviewDetailDialog
                review={selectedReview}
                onOpenChange={(open) => {
                    if(!open) setSelectedReview(null);
                }}
            />
        </>
    );
}
