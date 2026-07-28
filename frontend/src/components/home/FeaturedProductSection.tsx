import type { PublicProductCardItem } from "@/types/product.type";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HomeProductCard from "./HomeProductCard";

type Props = {
    title: string;
    products: PublicProductCardItem[];
    href?: string;
    pageSize?: number;
};

function chunkItems<T>(items: T[], size: number) {
    const chunks: T[][] = [];

    for(let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }

    return chunks;
}

export default function FeaturedProductSection({ title, products, href, pageSize = 4 }: Props) {
    const [page, setPage] = useState(0);
    const visiblePageSize = Math.min(Math.max(pageSize, 1), 4);
    const productPages = useMemo(() => chunkItems(products, visiblePageSize), [visiblePageSize, products]);
    const totalPages = productPages.length;
    const canSlide = products.length > visiblePageSize;
    const viewAllHref = href?.trim();
    const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
    const isFirstPage = currentPage <= 0;
    const isLastPage = currentPage >= totalPages - 1;

    if(!products.length) return null;

    function goPrevious() {
        if(isFirstPage) return;
        setPage(currentPage - 1);
    }

    function goNext() {
        if(isLastPage) return;
        setPage(currentPage + 1);
    }

    return (
        <section className="group/featured overflow-hidden rounded-md border-[10px] border-blue-500 bg-blue-500">
            <div
                className={`flex min-h-16 items-center bg-blue-500 px-3 text-white md:px-5 ${viewAllHref ? "justify-between" : "justify-center border-b border-white/60"}`}
            >
                <h2 className={`text-lg font-bold md:text-2xl ${viewAllHref ? "uppercase" : "text-center"}`}>
                    {title}
                </h2>

                {viewAllHref ? (
                    <Link to={viewAllHref} className="flex items-center gap-1 text-sm font-medium hover:underline">
                        Xem tất cả
                        <ChevronRight className="size-4" />
                    </Link>
                ) : null}
            </div>

            <div className="relative">
                {canSlide ? (
                    <button
                        type="button"
                        onClick={goPrevious}
                        disabled={isFirstPage}
                        className="absolute left-0 top-1/2 z-10 flex size-10 -translate-x-1/3 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-blue-950/80 text-white opacity-0 shadow-lg ring-1 ring-white/30 transition hover:bg-blue-950 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-0 group-hover/featured:opacity-100 group-hover/featured:disabled:opacity-35"
                        aria-label="Xem sản phẩm nổi bật trước"
                    >
                        <ChevronLeft className="size-6" />
                    </button>
                ) : null}

                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${currentPage * 100}%)` }}
                    >
                        {productPages.map((productPage, pageIndex) => (
                            <div
                                key={`featured-page-${pageIndex}`}
                                className={[
                                    "grid min-w-full grid-cols-2 gap-2 lg:grid-cols-4",
                                ].join(" ")}
                            >
                                {productPage.map((product) => (
                                    <HomeProductCard
                                        key={`${product.product_id}-${product.variant.variant_id}`}
                                        product={product}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {canSlide ? (
                    <button
                        type="button"
                        onClick={goNext}
                        disabled={isLastPage}
                        className="absolute right-0 top-1/2 z-10 flex size-10 -translate-y-1/2 translate-x-1/3 cursor-pointer items-center justify-center rounded-full bg-blue-950/80 text-white opacity-0 shadow-lg ring-1 ring-white/30 transition hover:bg-blue-950 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-0 group-hover/featured:opacity-100 group-hover/featured:disabled:opacity-35"
                        aria-label="Xem sản phẩm nổi bật tiếp theo"
                    >
                        <ChevronRight className="size-6" />
                    </button>
                ) : null}
            </div>
        </section>
    );
}
