import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Brand } from "@/types/brand.type";
import type { Category } from "@/types/category.type";

type Props = {
    brandId: string;
    categoryId: string;
    brands: Brand[];
    categories: Category[];
    onBrandChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onClear: () => void;
};

const ALL_VALUE = "all";

export default function ProductFilterBar({
    brandId,
    categoryId,
    brands,
    categories,
    onBrandChange,
    onCategoryChange,
    onClear,
}: Props) {
    return (
        <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 md:flex-row md:items-center">
            <Select value={brandId || ALL_VALUE} onValueChange={(value) => onBrandChange(value === ALL_VALUE ? "" : value)}>
                <SelectTrigger className="w-full md:w-[220px] cursor-pointer">
                    <SelectValue placeholder="Thương hiệu"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL_VALUE}>Tất cả thương hiệu</SelectItem>
                    {brands.map((brand) => (
                        <SelectItem key={brand.brand_id} value={brand.brand_id}>
                            {brand.brand_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={categoryId || ALL_VALUE} onValueChange={(value) => onCategoryChange(value === ALL_VALUE ? "" : value)}>
                <SelectTrigger className="w-full md:w-[220px] cursor-pointer">
                    <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL_VALUE}>Tất cả danh mục</SelectItem>
                    {categories.map((category) => (
                        <SelectItem key={category.category_id} value={category.category_id}>
                            {category.category_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button type="button" variant="outline" onClick={onClear} className="cursor-pointer">
                Xóa lọc
            </Button>
        </div>
    )
}