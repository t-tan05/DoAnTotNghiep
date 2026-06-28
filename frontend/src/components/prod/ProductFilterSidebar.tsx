import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PublicProductFilterOption } from "@/types/product.type";


type Props = {
    brands: PublicProductFilterOption[];
    categories: PublicProductFilterOption[];
    brandId: string;
    categoryId: string;
    minPrice: string;
    maxPrice: string;
    onBrandChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
    onClear: () => void;
};

export default function ProductFilterSidebar({
    brands,
    categories,
    brandId,
    categoryId,
    minPrice,
    maxPrice,
    onBrandChange,
    onCategoryChange,
    onMinPriceChange,
    onMaxPriceChange,
    onClear,
}: Props) {
    return (
        <aside className="space-y-5 rounded-md border bg-white p-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">Bộ lọc</h2>
                <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                    Xóa lọc
                </Button>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-semibold">Danh mục</h3>
                <select
                    value={categoryId}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                    <option value="">Tất cả thương hiệu</option>
                    {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                            {brand.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <h3 className="text-sm font-semibold">Khoảng giá</h3>

                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="number"
                        min={0}
                        value={minPrice}
                        onChange={(e) => onMinPriceChange(e.target.value)}
                        placeholder="Từ"
                    />

                    <Input
                        type="number"
                        min={0}
                        value={maxPrice}
                        onChange={(e) => onMaxPriceChange(e.target.value)}
                        placeholder="Đến"
                    />
                </div>
            </div>
        </aside>
    );
}