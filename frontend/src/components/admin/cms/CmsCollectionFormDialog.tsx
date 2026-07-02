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
import { Textarea } from "@/components/ui/textarea";
import { brandService } from "@/services/brand.service";
import { categoryService } from "@/services/category.service";
import { cmsService } from "@/services/cms.service";
import type { Brand } from "@/types/brand.type";
import type { Category } from "@/types/category.type";
import type { CmsCollection, CmsPageType } from "@/types/cms.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    collection?: CmsCollection | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

const pageTypes: Array<{ value: CmsPageType; label: string }> = [
    { value: "HOME", label: "Trang chủ" },
    { value: "CATEGORY", label: "Trang danh mục" },
    { value: "BRAND", label: "Trang thương hiệu" },
    { value: "CAMPAIGN", label: "Chiến dịch" },
    { value: "CUSTOM", label: "Trang tùy chỉnh" },
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

function createSlug(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export default function CmsCollectionFormDialog({
    open,
    collection,
    onOpenChange,
    onSuccess,
}: Props) {
    const isEdit = Boolean(collection);

    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        title: "",
        slug: "",
        description: "",
        pageType: "HOME" as CmsPageType,
        categoryId: "",
        brandId: "",
        categoryIds: [] as string[],
        brandIds: [] as string[],
        sortOrder: "0",
        isActive: "true",
    });

    useEffect(() => {
        if (!open) return;

        setForm({
            title: collection?.title ?? "",
            slug: collection?.slug ?? "",
            description: collection?.description ?? "",
            pageType: collection?.page_type ?? "HOME",
            categoryId: collection?.category_id ?? "",
            brandId: collection?.brand_id ?? "",
            categoryIds: getMetadataIds(collection?.metadata, "categoryIds"),
            brandIds: getMetadataIds(collection?.metadata, "brandIds"),
            sortOrder: String(collection?.sort_order ?? 0),
            isActive: collection?.is_active === false ? "false" : "true",
        });

        setError("");
    }, [open, collection]);

    useEffect(() => {
        if (!open) return;

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

    function handleTitleChange(value: string) {
        setForm((current) => ({
            ...current,
            title: value,
            slug: isEdit ? current.slug : createSlug(value),
        }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!form.title.trim()) return setError("Vui lòng nhập tên collection.");
        if (!form.slug.trim()) return setError("Vui lòng nhập slug.");

        try {
            setLoading(true);
            const metadata = buildMetadata(
                collection?.metadata,
                form.categoryIds,
                form.brandIds,
            );

            const payload = {
                title: form.title.trim(),
                slug: form.slug.trim(),
                description: form.description.trim() || null,
                pageType: form.pageType,
                categoryId: form.categoryId || null,
                brandId: form.brandId || null,
                sortOrder: Number(form.sortOrder || 0),
                isActive: form.isActive === "true",
                metadata,
            };

            if (isEdit && collection) {
                await cmsService.updateCollection(collection.collection_id, payload);
                toast.success("Cập nhật CMS collection thành công.");
            } else {
                await cmsService.createCollection(payload);
                toast.success("Tạo CMS collection thành công.");
            }

            onOpenChange(false);
            onSuccess();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Cập nhật CMS collection" : "Thêm CMS collection"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormError message={error} />

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Tên collection</Label>
                            <Input
                                value={form.title}
                                onChange={(event) => handleTitleChange(event.target.value)}
                                placeholder="Ví dụ: Laptop gaming"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                                value={form.slug}
                                onChange={(event) => updateField("slug", event.target.value)}
                                placeholder="laptop-gaming"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Loại trang</Label>
                            <Select
                                value={form.pageType}
                                onValueChange={(value) => updateField("pageType", value)}
                            >
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {pageTypes.map((item) => (
                                        <SelectItem key={item.value} value={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select
                                value={form.isActive}
                                onValueChange={(value) => updateField("isActive", value)}
                            >
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Đang bật</SelectItem>
                                    <SelectItem value="false">Đang tắt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Danh mục áp dụng</Label>
                            <Select
                                value={form.categoryId || "none"}
                                disabled={loadingOptions}
                                onValueChange={(value) =>
                                    updateField("categoryId", value === "none" ? "" : value)
                                }
                            >
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue placeholder="Không chọn danh mục" />
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
                            <Label>Thương hiệu áp dụng</Label>
                            <Select
                                value={form.brandId || "none"}
                                disabled={loadingOptions}
                                onValueChange={(value) =>
                                    updateField("brandId", value === "none" ? "" : value)
                                }
                            >
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue placeholder="Không chọn thương hiệu" />
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
                            <Label>Thứ tự</Label>
                            <Input
                                type="number"
                                value={form.sortOrder}
                                onChange={(event) => updateField("sortOrder", event.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Mô tả</Label>
                        <Textarea
                            value={form.description}
                            onChange={(event) => updateField("description", event.target.value)}
                            placeholder="Mô tả ngắn cho collection..."
                        />
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
                        <Button
                            type="button"
                            variant="outline"
                            disabled={loading}
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>

                        <SpinnerButton
                            type="submit"
                            loading={loading}
                            loadingText={isEdit ? "Đang cập nhật..." : "Đang tạo..."}
                        >
                            {isEdit ? "Cập nhật" : "Tạo mới"}
                        </SpinnerButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
