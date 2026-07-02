import HeroSlider from "@/components/banner/HeroSlider";
import PageLoading from "@/components/common/PageLoading";
import FeaturedProductSection from "@/components/home/FeaturedProductSection";
import TechNewsSection from "@/components/home/TechNewsSection";
import { blogService } from "@/services/blog.service";
import { productService } from "@/services/product.service";
import type { Blog } from "@/types/blog.type";
import type { PublicProductCardItem } from "@/types/product.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function normalizedText(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function getProductText(product: PublicProductCardItem) {
    return normalizedText([
        product.product_name,
        product.variant.variant_name,
        product.brand.brand_name,
        product.category.category_name,
        ...product.variant.attributes.map((attribute) => attribute.value),
    ].filter(Boolean).join(" "));
}

function pickProducts(products: PublicProductCardItem[], keywords: string[], fallbackStart: number) {
    const normalizedKeywords = keywords.map(normalizedText);
    const matched = products.filter((product) => {
        const text = getProductText(product);
        return normalizedKeywords.some((keyword) => text.includes(keyword));
    });

    return (matched.length >= 5 ? matched : products.slice(fallbackStart, fallbackStart + 5)).slice(0, 5);
}

export default function HomeLandingPage() {
    const [products, setProducts] = useState<PublicProductCardItem[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadHomeData() {
        try {
            setLoading(true);

            const [productData, blogData] = await Promise.all([
                productService.getAllPublic({
                    page: 1,
                    limit: 40,
                    sortBy: "newest",
                }),
                blogService.getPublic({
                    page: 1,
                    limit: 4,
                    sortBy: "published_at",
                    sortOrder: "desc",
                }),
            ]);

            setProducts(productData.products ?? []);
            setBlogs(blogData?.blogs ?? []);
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadHomeData();
    }, []);

    const productSections = useMemo(() => {
        return [
            {
                title: "Laptop nổi bật",
                href: "/products?search=laptop",
                products: pickProducts(products, ["laptop", "notebook", "macbook"], 0),
            },
            {
                title: "Gaming Gear",
                href: "/products?search=gaming",
                products: pickProducts(products, ["gaming", "gear", "chuot", "ban phim", "tai nghe", "logitech", "newmen"], 5),
            },
            {
                title: "Điện thoại, máy tính bảng, đồng hồ thông minh",
                href: "/products?search=điện thoại",
                products: pickProducts(products, ["dien thoai", "iphone", "ipad", "tablet", "dong ho", "watch"], 10),
            },
        ];
    }, [products]);

    return (
        <main className="bg-[#f5f6fb] pb-8">
            <section className="mx-auto max-w-7xl px-4 py-3 md:px-6 md:py-5">
                <HeroSlider />
            </section>

            {loading ? (
                <PageLoading text="Đang tải trang chủ..." />
            ) : (
                <div className="mx-auto max-w-7xl space-y-7 px-4 md:px-6">
                    {productSections.map((section) => (
                        <FeaturedProductSection
                            key={section.title}
                            title={section.title}
                            href={section.href}
                            products={section.products}
                        />
                    ))}

                    <TechNewsSection blogs={blogs} />
                </div>
            )}
        </main>
    );
}
