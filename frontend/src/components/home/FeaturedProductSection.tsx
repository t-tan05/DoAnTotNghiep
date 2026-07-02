import type { PublicProductCardItem } from "@/types/product.type";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import HomeProductCard from "./HomeProductCard";

type Props = {
    title: string;
    products: PublicProductCardItem[];
    href?: string;
};

export default function FeaturedProductSection({ title, products, href = "/products" }: Props) {
    if(!products.length) return null;

    return (
        <section className="overflow-hidden rounded-md border-[10px] border-blue-500 bg-blue-500">
            <div className="flex min-h-16 items-center justify-between bg-blue-500 px-3 text-white md:px-5">
                <h2 className="text-lg font-bold uppercase md:text-2xl">{title}</h2>

                <Link to={href} className="flex items-center gap-1 text-sm font-medium hover:underline">
                    Xem tất cả
                    <ChevronRight className="size-4" />
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
                {products.slice(0, 5).map((product) => (
                    <HomeProductCard
                        key={`${product.product_id}-${product.variant.variant_id}`}
                        product={product}
                    />
                ))}
            </div>
        </section>
    );
}
