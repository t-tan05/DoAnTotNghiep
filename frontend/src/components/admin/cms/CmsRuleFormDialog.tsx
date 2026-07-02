import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
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
import { brandService } from "@/services/brand.service";
import { categoryService } from "@/services/category.service";
import { cmsService } from "@/services/cms.service";
import type { Brand } from "@/types/brand.type";
import type { Category } from "@/types/category.type";
import type { CmsCollectionRule, CmsRuleSortBy } from "@/types/cms.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    collectionId: string;
    rule?: CmsCollectionRule | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

const sortOptions: Array<{ value: CmsRuleSortBy; label: string }> = [
    { value: "NEWEST", label: "Mới nhất" },
    { value: "PRICE_ASC", label: "Giá tăng dần" },
    { value: "PRICE_DESC", label: "Giá giảm dần" },
    { value: "BEST_SELLING", label: "Bán chạy" },
    { value: "PROMOTION", label: "Khuyến mãi" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getMetadataIds(metadata: unknown, key: "categoryIds" | "brandIds") {
    if(!isRecord(metadata) || !Array.isArray(metadata[key])) {
        return [];
    }

    return metadata[key]
        .map((item) => String(item || "").trim())
        .filter(Boolean);
}

function buildMetadata(
    metadata: unknown,
    categoryIds: string[],
    brandIds: string[],
) {
    const nextMetadata = isRecord(metadata) ? { ...metadata } : {};

    if(categoryIds.length > 0) {
        nextMetadata.categoryIds = categoryIds;
    }else {
        delete nextMetadata.categoryIds;
    }

    if(brandIds.length > 0) {
        nextMetadata.brandIds = brandIds;
    }else {
        delete nextMetadata.brandIds;
    }

    return Object.keys(nextMetadata).length > 0 ? nextMetadata : undefined;
}

export default function CmsRuleFormDialog({
    open,
    collectionId,
    rule,
    onOpenChange,
    onSuccess,
}: Props) {
    const isEdit = Boolean(rule);

    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        categoryId: "",
        brandId: "",
        categoryIds: [] as string[],
        brandIds: [] as string[],
        attributeName: "",
        attributeValue: "",
        keyword: "",
        minPrice: "",
        maxPrice: "",
        sortBy: "NEWEST" as CmsRuleSortBy,
        limit: "20",
        isActive: "true",
    });

    useEffect(() => {
        if(!open) return;

        setForm({
            categoryId: rule?.category_id ?? "",
            brandId: rule?.brand_id ?? "",
            categoryIds: getMetadataIds(rule?.metadata, "categoryIds"),
            brandIds: getMetadataIds(rule?.metadata, "brandIds"),
            attributeName: rule?.attribute_name ?? "",
            attributeValue: rule?.attribute_value ?? "",
            keyword: rule?.keyword ?? "",
            minPrice: rule?.min_price !== null && rule?.min_price !== undefined ? String(rule.min_price) : "",
            maxPrice: rule?.max_price !== null && rule?.max_price !== undefined ? String(rule.max_price) : "",
            sortBy: rule?.sort_by ?? "NEWEST",
            limit: String(rule?.limit ?? 20),
            isActive: rule?.is_active === false ? "false" : "true",
        });
        setError("");
    }, [open, rule]);

    useEffect(() => {
        if(!open) return;

        async function loadOptions() {
            try {
                setLoadingOptions(true);

                const [brandData, categoryData] = await Promise.all([
                    brandService.getAll({ page: 1, limit: 1000, search: "", sortBy: "brand_name", sortOrder: "asc" }),
                    categoryService.getAll({ page: 1, limit: 1000, search: "", sortBy: "category_name", sortOrder: "asc" }),
                ]);

                setBrands(brandData?.brands ?? []);
                setCategories(categoryData?.categories ?? []);
            } catch(error) {
                toast.error(getErrorMessage(error));
            } finally {
                setLoadingOptions(false);
            }
        }

        loadOptions();
    }, [open]);

    function updateField(name: keyof typeof form, value: string) {
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function toggleListValue(name: "categoryIds" | "brandIds", value: string) {
        setForm((current) => {
            const currentValues = current[name];
            const nextValues = currentValues.includes(value)
                ? currentValues.filter((item) => item !== value)
                : [...currentValues, value];

            return {
                ...current,
                [name]: nextValues,
            };
        });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if(Number(form.limit || 0) < 1) return setError("Số lượng sản phẩm phải lớn hơn 0.");

        try {
            setLoading(true);
            const metadata = buildMetadata(
                rule?.metadata,
                form.categoryIds,
                form.brandIds,
            );

            const payload = {
                categoryId: form.categoryId || null,
                brandId: form.brandId || null,
                attributeName: form.attributeName.trim() || null,
                attributeValue: form.attributeValue.trim() || null,
                keyword: form.keyword.trim() || null,
                minPrice: form.minPrice ? Number(form.minPrice) : null,
                maxPrice: form.maxPrice ? Number(form.maxPrice) : null,
                sortBy: form.sortBy,
                limit: Number(form.limit || 20),
                isActive: form.isActive === "true",
                metadata,
            };

            if(isEdit && rule) {
                await cmsService.updateRule(rule.rule_id, payload);
                toast.success("Cập nhật rule thành công.");
            } else {
                await cmsService.createRule(collectionId, payload);
                toast.success("Tạo rule thành công.");
            }

            onOpenChange(false);
            onSuccess();
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Cập nhật rule" : "Thêm rule"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormError message={error} />

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Danh mục</Label>
                            <Select value={form.categoryId || "none"} disabled={loadingOptions} onValueChange={(value) => updateField("categoryId", value === "none" ? "" : value)}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Không chọn</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.category_id} value={category.category_id}>
                                            {category.category_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Thương hiệu</Label>
                            <Select value={form.brandId || "none"} disabled={loadingOptions} onValueChange={(value) => updateField("brandId", value === "none" ? "" : value)}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Không chọn</SelectItem>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.brand_id} value={brand.brand_id}>
                                            {brand.brand_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Tên thuộc tính</Label>
                            <Input value={form.attributeName} onChange={(event) => updateField("attributeName", event.target.value)} placeholder="Nhu cầu" />
                        </div>

                        <div className="space-y-2">
                            <Label>Giá trị thuộc tính</Label>
                            <Input value={form.attributeValue} onChange={(event) => updateField("attributeValue", event.target.value)} placeholder="Gaming" />
                        </div>

                        <div className="space-y-2">
                            <Label>Từ khóa</Label>
                            <Input value={form.keyword} onChange={(event) => updateField("keyword", event.target.value)} placeholder="laptop ai" />
                        </div>

                        <div className="space-y-2">
                            <Label>Sắp xếp</Label>
                            <Select value={form.sortBy} onValueChange={(value) => updateField("sortBy", value)}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortOptions.map((item) => (
                                        <SelectItem key={item.value} value={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Giá từ</Label>
                            <Input type="number" value={form.minPrice} onChange={(event) => updateField("minPrice", event.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Giá đến</Label>
                            <Input type="number" value={form.maxPrice} onChange={(event) => updateField("maxPrice", event.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Giới hạn</Label>
                            <Input type="number" min={1} value={form.limit} onChange={(event) => updateField("limit", event.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select value={form.isActive} onValueChange={(value) => updateField("isActive", value)}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Đang bật</SelectItem>
                                    <SelectItem value="false">Đang tắt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Chọn nhiều danh mục</Label>
                            <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border p-3">
                                {categories.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Chưa có danh mục.
                                    </p>
                                ) : categories.map((category) => (
                                    <label
                                        key={category.category_id}
                                        className="flex cursor-pointer items-center gap-2 text-sm"
                                    >
                                        <Checkbox
                                            checked={form.categoryIds.includes(category.category_id)}
                                            disabled={loadingOptions}
                                            onCheckedChange={() => toggleListValue("categoryIds", category.category_id)}
                                        />
                                        <span>{category.category_name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Chọn nhiều thương hiệu</Label>
                            <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border p-3">
                                {brands.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Chưa có thương hiệu.
                                    </p>
                                ) : brands.map((brand) => (
                                    <label
                                        key={brand.brand_id}
                                        className="flex cursor-pointer items-center gap-2 text-sm"
                                    >
                                        <Checkbox
                                            checked={form.brandIds.includes(brand.brand_id)}
                                            disabled={loadingOptions}
                                            onCheckedChange={() => toggleListValue("brandIds", brand.brand_id)}
                                        />
                                        <span>{brand.brand_name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <SpinnerButton type="submit" loading={loading} loadingText="Đang lưu...">
                            {isEdit ? "Cập nhật" : "Tạo mới"}
                        </SpinnerButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
