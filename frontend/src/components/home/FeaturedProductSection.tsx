import type { PublicProductCardItem } from "@/types/product.type";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HomeProductCard from "./HomeProductCard";

type Props = {
    title: string;
    products: PublicProductCardItem[];
    href?: string;
};

export default function FeaturedProductSection({ title, products, href = "/products" }: Props) {
    const [page, setPage] = useState(0);
    const pageSize = 4;
    const totalPages = Math.ceil(products.length / pageSize);
    const canSlide = products.length > pageSize;
    const visibleProducts = useMemo(() => {
        const start = page * pageSize;

        return products.slice(start, start + pageSize);
    }, [page, products]);

    useEffect(() => {
        if(page > totalPages - 1) {
            setPage(0);
        }
    }, [page, totalPages]);

    if(!products.length) return null;

    function goPrevious() {
        setPage((current) => current <= 0 ? totalPages - 1 : current - 1);
    }

    function goNext() {
        setPage((current) => current >= totalPages - 1 ? 0 : current + 1);
    }

    return (
        <section className="group/featured overflow-hidden rounded-md border-[10px] border-blue-500 bg-blue-500">
            <div className="flex min-h-16 items-center justify-between bg-blue-500 px-3 text-white md:px-5">
                <h2 className="text-lg font-bold uppercase md:text-2xl">{title}</h2>

                <Link to={href} className="flex items-center gap-1 text-sm font-medium hover:underline">
                    Xem tất cả
                    <ChevronRight className="size-4" />
                </Link>
            </div>

            <div className="relative">
                {canSlide ? (
                    <button
                        type="button"
                        onClick={goPrevious}
                        className="absolute left-0 top-1/2 z-10 flex size-10 -translate-x-1/3 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-blue-950/80 text-white opacity-0 shadow-lg ring-1 ring-white/30 transition hover:bg-blue-950 focus-visible:opacity-100 group-hover/featured:opacity-100"
                        aria-label="Xem sản phẩm nổi bật trước"
                    >
                        <ChevronLeft className="size-6" />
                    </button>
                ) : null}

                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                        <HomeProductCard
                            key={`${product.product_id}-${product.variant.variant_id}`}
                            product={product}
                        />
                    ))}
                </div>

                {canSlide ? (
                    <button
                        type="button"
                        onClick={goNext}
                        className="absolute right-0 top-1/2 z-10 flex size-10 -translate-y-1/2 translate-x-1/3 cursor-pointer items-center justify-center rounded-full bg-blue-950/80 text-white opacity-0 shadow-lg ring-1 ring-white/30 transition hover:bg-blue-950 focus-visible:opacity-100 group-hover/featured:opacity-100"
                        aria-label="Xem sản phẩm nổi bật tiếp theo"
                    >
                        <ChevronRight className="size-6" />
                    </button>
                ) : null}
            </div>
        </section>
    );
}
