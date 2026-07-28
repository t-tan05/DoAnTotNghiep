import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PublicProductFilterOption } from "@/types/product.type";
import { Search } from "lucide-react";

const PRICE_STEP = 500000;

const formatPrice = (value: number | string) => {
    return Number(value || 0).toLocaleString("vi-VN") + "đ";
};

const clampPrice = (value: string, fallback: number, maxPriceLimit: number) => {
    const numericValue = Number(value);

    if(Number.isNaN(numericValue)) return fallback;

    return Math.min(Math.max(numericValue, 0), maxPriceLimit);
};

const priceRanges = [
    { label: "Dưới 5 triệu", min: "", max: "5000000" },
    { label: "5 - 10 triệu", min: "5000000", max: "10000000" },
    { label: "10 - 20 triệu", min: "10000000", max: "20000000" },
    { label: "20 - 50 triệu", min: "20000000", max: "50000000" },
    { label: "Trên 50 triệu", min: "50000000", max: "" },
];

type Props = {
    brands: PublicProductFilterOption[];
    categories: PublicProductFilterOption[];
    brandId: string;
    categoryId: string;
    search: string;
    minPrice: string;
    maxPrice: string;
    maxAvailablePrice: number;
    onSearchChange: (value: string) => void;
    onBrandChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
    onApply: () => void;
    onPriceRangeSelect: (minPrice: string, maxPrice: string) => void;
    onClear: () => void;
};

export default function ProductFilterSidebar({
    brands,
    categories,
    brandId,
    categoryId,
    search,
    minPrice,
    maxPrice,
    maxAvailablePrice,
    onSearchChange,
    onBrandChange,
    onCategoryChange,
    onMinPriceChange,
    onMaxPriceChange,
    onApply,
    onPriceRangeSelect,
    onClear,
}: Props) {
    const realMaxPrice = Math.max(Number(maxAvailablePrice || 0), 0);
    const hasPriceRange = realMaxPrice > 0;
    const maxPriceLimit = hasPriceRange ? Math.max(realMaxPrice, PRICE_STEP) : 0;

    const sliderMinPrice = clampPrice(minPrice, 0, maxPriceLimit);
    const sliderMaxPrice = clampPrice(maxPrice, maxPriceLimit, maxPriceLimit);

    const safeMinPrice = hasPriceRange
        ? Math.min(sliderMinPrice, Math.max(sliderMaxPrice - PRICE_STEP, 0))
        : 0;
    const safeMaxPrice = hasPriceRange
        ? Math.max(sliderMaxPrice, Math.min(sliderMinPrice + PRICE_STEP, maxPriceLimit))
        : 0;

    const rangeLeft = hasPriceRange ? (safeMinPrice / maxPriceLimit) * 100 : 0;
    const rangeRight = hasPriceRange ? 100 - (safeMaxPrice / maxPriceLimit) * 100 : 100;

    return (
        <aside className="space-y-5 rounded-md border bg-white p-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">Bộ lọc</h2>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="cursor-pointer"
                >
                    Xóa lọc
                </Button>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-semibold">Tìm kiếm</h3>

                <div className="flex gap-2">
                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => {
                            if(e.key === "Enter") onApply();
                        }}
                        placeholder="Nhập tên sản phẩm..."
                    />

                    <Button
                        type="button"
                        onClick={onApply}
                        className="shrink-0 cursor-pointer"
                        aria-label="Tìm kiếm"
                    >
                        <Search className="size-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-semibold">Khoảng giá</h3>

                <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2 text-center text-sm font-medium">
                        <div className="rounded-md border bg-background px-3 py-2">
                            {formatPrice(safeMinPrice)}
                        </div>
                        <div className="rounded-md border bg-background px-3 py-2">
                            {formatPrice(safeMaxPrice)}
                        </div>
                    </div>

                    <div className="relative h-7">
                        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
                        <div
                            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-blue-700"
                            style={{
                                left: `${rangeLeft}%`,
                                right: `${rangeRight}%`,
                            }}
                        />

                        <input
                            type="range"
                            min={0}
                            max={maxPriceLimit}
                            step={PRICE_STEP}
                            value={safeMinPrice}
                            disabled={!hasPriceRange}
                            onChange={(e) => {
                                const nextValue = Math.min(Number(e.target.value), safeMaxPrice - PRICE_STEP);
                                onMinPriceChange(String(nextValue));
                            }}
                            onMouseUp={onApply}
                            onTouchEnd={onApply}
                            className="pointer-events-none absolute inset-0 h-7 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-700 [&::-webkit-slider-thumb]:bg-white"
                            aria-label="Giá thấp nhất"
                        />

                        <input
                            type="range"
                            min={0}
                            max={maxPriceLimit}
                            step={PRICE_STEP}
                            value={safeMaxPrice}
                            disabled={!hasPriceRange}
                            onChange={(e) => {
                                const nextValue = Math.max(Number(e.target.value), safeMinPrice + PRICE_STEP);
                                onMaxPriceChange(String(nextValue));
                            }}
                            onMouseUp={onApply}
                            onTouchEnd={onApply}
                            className="pointer-events-none absolute inset-0 h-7 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-700 [&::-webkit-slider-thumb]:bg-white"
                            aria-label="Giá cao nhất"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    {priceRanges.map((range) => (
                        <Button
                            key={range.label}
                            type="button"
                            variant="outline"
                            disabled={!hasPriceRange}
                            onClick={() => {
                                onPriceRangeSelect(
                                    range.min || "0",
                                    range.max || String(realMaxPrice)
                                );
                            }}
                            className="h-9 w-full cursor-pointer justify-start disabled:cursor-not-allowed"
                        >
                            {range.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-semibold">Danh mục</h3>
                <select
                    value={categoryId}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm cursor-pointer"
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-semibold">Thương hiệu</h3>
                <select
                    value={brandId}
                    onChange={(e) => onBrandChange(e.target.value)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm cursor-pointer"
                >
                    <option value="">Tất cả thương hiệu</option>
                    {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                            {brand.name}
                        </option>
                    ))}
                </select>
            </div>
        </aside>
    );
}
