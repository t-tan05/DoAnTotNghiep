import BlogContent from "@/components/blog/BlogContent";
import FormError from "@/components/common/FormError";
import RichTextEditor from "@/components/common/RichTextEditor";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { brandService } from "@/services/brand.service";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import type { Brand } from "@/types/brand.type";
import type { Category } from "@/types/category.type";
import type { AdminProduct } from "@/types/product.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    product: AdminProduct;
    onSuccess: () => void;
};

export default function ProductBasicInfoForm({ product, onSuccess }: Props) {
    const [editing, setEditing] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        productName: product.product_name,
        warrantyPeriod: String(product.warranty_period),
        brandId: product.brands.brand_id,
        categoryId: product.categories.category_id,
        description: product.description ?? "",
    });

    useEffect(() => {
        if (editing) return;

        setForm({
            productName: product.product_name,
            warrantyPeriod: String(product.warranty_period),
            brandId: product.brands.brand_id,
            categoryId: product.categories.category_id,
            description: product.description ?? "",
        });
    }, [product, editing]);

    useEffect(() => {
        if (!editing) return;

        async function loadOptions() {
            try {
                setLoadingOptions(true);

                const [brandData, categoryData] = await Promise.all([
                    brandService.getAll({
                        page: 1,
                        limit: 1000,
                        search: "",
                        sortBy: "brand_name",
                        sortOrder: "asc",
                    }),
                    categoryService.getAll({
                        page: 1,
                        limit: 1000,
                        search: "",
                        sortBy: "category_name",
                        sortOrder: "asc",
                    }),
                ]);

                setBrands(brandData?.brands ?? []);
                setCategories(categoryData?.categories ?? []);
            } catch (error) {
                toast.error(getErrorMessage(error));
            } finally {
                setLoadingOptions(false);
            }
        }

        loadOptions();
    }, [editing]);

    function updateField(name: keyof typeof form, value: string) {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function cancelEdit() {
        setEditing(false);
        setError("");
        setForm({
            productName: product.product_name,
            warrantyPeriod: String(product.warranty_period),
            brandId: product.brands.brand_id,
            categoryId: product.categories.category_id,
            description: product.description ?? "",
        });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!form.productName.trim()) return setError("Vui lòng nhập tên sản phẩm.");
        if (!form.brandId) return setError("Vui lòng chọn thương hiệu.");
        if (!form.categoryId) return setError("Vui lòng chọn danh mục.");
        if (form.warrantyPeriod === "" || Number(form.warrantyPeriod) < 0) {
            return setError("Bảo hành không hợp lệ.");
        }

        try {
            setSaving(true);

            await productService.update(product.product_id, {
                productName: form.productName.trim(),
                brandId: form.brandId,
                categoryId: form.categoryId,
                warrantyPeriod: Number(form.warrantyPeriod),
                description: form.description.trim() || null,
            });

            toast.success("Cập nhật thông tin sản phẩm thành công.");
            setEditing(false);
            onSuccess();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    }

    if (!editing) {
        return (
            <div className="rounded-lg border bg-background p-5">
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold">Thông tin chung</h2>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(true)}
                        className="cursor-pointer"
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </Button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-sm text-muted-foreground">Tên sản phẩm</p>
                        <p className="font-medium">{product.product_name}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Bảo hành</p>
                        <p className="font-medium">{product.warranty_period} tháng</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Thương hiệu</p>
                        <p className="font-medium">{product.brands.brand_name}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Danh mục</p>
                        <p className="font-medium">{product.categories.category_name}</p>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Mô tả</p>
                    {product.description ? (
                        <div className="mt-2 rounded-md border bg-muted/20 p-3">
                            <BlogContent html={product.description} />
                        </div>
                    ) : (
                        <p className="mt-1 text-sm">Không có mô tả</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-lg border bg-background p-5">
            <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">Cập nhật thông tin chung</h2>
            </div>

            <div className="mt-4 space-y-4">
                <FormError message={error} />

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Tên sản phẩm</Label>
                        <Input
                            value={form.productName}
                            onChange={(event) => updateField("productName", event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Bảo hành (tháng)</Label>
                        <Input
                            type="number"
                            min={0}
                            value={form.warrantyPeriod}
                            onChange={(event) => updateField("warrantyPeriod", event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Thương hiệu</Label>
                        <Select
                            value={form.brandId}
                            onValueChange={(value) => updateField("brandId", value)}
                            disabled={loadingOptions}
                        >
                            <SelectTrigger className="w-full cursor-pointer">
                                <SelectValue placeholder="Chọn thương hiệu" />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start">
                                {brands.map((brand) => (
                                    <SelectItem key={brand.brand_id} value={brand.brand_id}>
                                        {brand.brand_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Danh mục</Label>
                        <Select
                            value={form.categoryId}
                            onValueChange={(value) => updateField("categoryId", value)}
                            disabled={loadingOptions}
                        >
                            <SelectTrigger className="w-full cursor-pointer">
                                <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start">
                                {categories.map((category) => (
                                    <SelectItem key={category.category_id} value={category.category_id}>
                                        {category.category_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Mô tả</Label>
                    <RichTextEditor
                        value={form.description}
                        onChange={(value) => updateField("description", value)}
                        placeholder="Nhập mô tả chung cho sản phẩm..."
                        minHeightClassName="min-h-[240px]"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" disabled={saving} onClick={cancelEdit} className="cursor-pointer">
                        Hủy
                    </Button>

                    <SpinnerButton type="submit" loading={saving} loadingText="Đang lưu..." className="cursor-pointer">
                        Lưu thay đổi
                    </SpinnerButton>
                </div>
            </div>
        </form>
    );
}
