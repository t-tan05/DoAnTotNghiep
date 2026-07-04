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
import { productLineService } from "@/services/productLine.service";
import type { Brand } from "@/types/brand.type";
import type { Category } from "@/types/category.type";
import type { CmsCollection, CmsPageType } from "@/types/cms.type";
import type { ProductLine } from "@/types/product-line.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    collection?: CmsCollection | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

type OptionItem = {
    id: string;
    label: string;
    caption?: string;
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

function getMetadataIds(metadata: unknown, key: "categoryIds" | "brandIds" | "lineIds") {
    if(!isRecord(metadata) || !Array.isArray(metadata[key])) {
        return [];
    }

    return metadata[key]
        .map((item) => String(item || "").trim())
        .filter(Boolean);
}

function uniqueIds(values: Array<string | null | undefined>) {
    return Array.from(new Set(values.filter(Boolean) as string[]));
}

function buildMetadata(
    metadata: unknown,
    categoryIds: string[],
    brandIds: string[],
    lineIds: string[],
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

    if(lineIds.length > 0) {
        nextMetadata.lineIds = lineIds;
    }else {
        delete nextMetadata.lineIds;
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
    const [productLines, setProductLines] = useState<ProductLine[]>([]);
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
        lineIds: [] as string[],
        sortOrder: "0",
        isActive: "true",
    });

    const categoryOptions = useMemo<OptionItem[]>(() => categories.map((category) => ({
        id: category.category_id,
        label: category.category_name,
    })), [categories]);

    const brandOptions = useMemo<OptionItem[]>(() => brands.map((brand) => ({
        id: brand.brand_id,
        label: brand.brand_name,
    })), [brands]);

    const lineOptions = useMemo<OptionItem[]>(() => {
        return productLines
            .filter((line) => {
                const matchesCategory = form.categoryIds.length === 0 || form.categoryIds.includes(line.category_id);
                const matchesBrand = form.brandIds.length === 0 || form.brandIds.includes(line.brand_id);

                return matchesCategory && matchesBrand;
            })
            .map((line) => ({
                id: line.line_id,
                label: line.line_name,
                caption: `${line.brands?.brand_name || "-"} / ${line.categories?.category_name || "-"}`,
            }));
    }, [form.brandIds, form.categoryIds, productLines]);

    useEffect(() => {
        if (!open) return;

        setForm({
            title: collection?.title ?? "",
            slug: collection?.slug ?? "",
            description: collection?.description ?? "",
            pageType: collection?.page_type ?? "HOME",
            categoryId: "",
            brandId: "",
            categoryIds: uniqueIds([
                collection?.category_id,
                ...getMetadataIds(collection?.metadata, "categoryIds"),
            ]),
            brandIds: uniqueIds([
                collection?.brand_id,
                ...getMetadataIds(collection?.metadata, "brandIds"),
            ]),
            lineIds: getMetadataIds(collection?.metadata, "lineIds"),
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

                const [brandData, categoryData, lineData] = await Promise.all([
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
                    productLineService.getAll({
                        page: 1,
                        limit: 1000,
                        search: "",
                        sortBy: "display_order",
                        sortOrder: "asc",
                        isActive: true,
                    }),
                ]);

                setBrands(brandData?.brands ?? []);
                setCategories(categoryData?.categories ?? []);
                setProductLines(lineData?.productLines ?? []);
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

    function toggleListValue(name: "categoryIds" | "brandIds" | "lineIds", value: string) {
        setForm((current) => {
            const currentValues = current[name];
            const nextValues = currentValues.includes(value)
                ? currentValues.filter((item) => item !== value)
                : [...currentValues, value];

            const next = {
                ...current,
                [name]: nextValues,
            };

            if(name === "categoryIds" || name === "brandIds") {
                const categoryIds = name === "categoryIds" ? nextValues : current.categoryIds;
                const brandIds = name === "brandIds" ? nextValues : current.brandIds;
                const validLineIds = new Set(
                    productLines
                        .filter((line) => {
                            const matchesCategory = categoryIds.length === 0 || categoryIds.includes(line.category_id);
                            const matchesBrand = brandIds.length === 0 || brandIds.includes(line.brand_id);

                            return matchesCategory && matchesBrand;
                        })
                        .map((line) => line.line_id),
                );

                next.lineIds = current.lineIds.filter((lineId) => validLineIds.has(lineId));
            }

            return next;
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
                form.lineIds,
            );

            const payload = {
                title: form.title.trim(),
                slug: form.slug.trim(),
                description: form.description.trim() || null,
                pageType: form.pageType,
                categoryId: null,
                brandId: null,
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
            <DialogContent className="max-h-[92vh] w-[calc(100vw-2rem)] overflow-hidden p-0 sm:!max-w-5xl">
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle>
                        {isEdit ? "Cập nhật CMS collection" : "Thêm CMS collection"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex max-h-[calc(92vh-73px)] flex-col">
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
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

                        <div className="hidden">
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

                        <div className="hidden">
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

                    <section className="space-y-4 rounded-lg border bg-muted/20 p-4">
                        <div>
                            <h3 className="font-semibold">Điều kiện lấy sản phẩm</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Chọn nhiều điều kiện để collection tự gom sản phẩm. Bỏ trống nghĩa là không giới hạn theo điều kiện đó.
                            </p>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-3">
                            <MultiCheckList
                                title="Danh mục"
                                description="Nhóm sản phẩm chính"
                                items={categoryOptions}
                                selectedIds={form.categoryIds}
                                loading={loadingOptions}
                                emptyText="Chưa có danh mục."
                                onToggle={(id) => toggleListValue("categoryIds", id)}
                            />

                            <MultiCheckList
                                title="Thương hiệu"
                                description="Có thể chọn nhiều brand"
                                items={brandOptions}
                                selectedIds={form.brandIds}
                                loading={loadingOptions}
                                emptyText="Chưa có thương hiệu."
                                onToggle={(id) => toggleListValue("brandIds", id)}
                            />

                            <MultiCheckList
                                title="Dòng sản phẩm"
                                description="Tự lọc theo danh mục/brand đã chọn"
                                items={lineOptions}
                                selectedIds={form.lineIds}
                                loading={loadingOptions}
                                emptyText="Không có dòng sản phẩm phù hợp."
                                onToggle={(id) => toggleListValue("lineIds", id)}
                            />
                        </div>
                    </section>

                    <div className="hidden">
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
                            <p className="text-xs font-medium text-muted-foreground">Dòng sản phẩm</p>
                            <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border p-3">
                                {productLines.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Chưa có dòng sản phẩm.
                                    </p>
                                ) : productLines.map((line) => (
                                    <label
                                        key={line.line_id}
                                        className="flex cursor-pointer items-start gap-2 text-sm"
                                    >
                                        <Checkbox
                                            checked={form.lineIds.includes(line.line_id)}
                                            disabled={loadingOptions}
                                            onCheckedChange={() => toggleListValue("lineIds", line.line_id)}
                                        />
                                        <span className="min-w-0">
                                            <span className="block truncate">{line.line_name}</span>
                                            <span className="block truncate text-xs text-muted-foreground">
                                                {line.brands?.brand_name || "-"} / {line.categories?.category_name || "-"}
                                            </span>
                                        </span>
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

                    </div>

                    <DialogFooter className="shrink-0 border-t px-6 py-4">
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

function matchesSearch(item: OptionItem, search: string) {
    const keyword = search.trim().toLowerCase();

    if(!keyword) return true;

    return `${item.label} ${item.caption || ""}`.toLowerCase().includes(keyword);
}

function MultiCheckList({
    title,
    description,
    items,
    selectedIds,
    loading,
    emptyText,
    onToggle,
}: {
    title: string;
    description?: string;
    items: OptionItem[];
    selectedIds: string[];
    loading?: boolean;
    emptyText: string;
    onToggle: (id: string) => void;
}) {
    const [search, setSearch] = useState("");
    const filteredItems = items.filter((item) => matchesSearch(item, search));

    return (
        <div className="rounded-lg border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-medium">{title}</h3>
                    {description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    ) : null}
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {selectedIds.length} chọn
                </span>
            </div>

            <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm nhanh..."
                className="mt-3"
            />

            <div className="mt-3 h-56 space-y-2 overflow-y-auto rounded-md border p-3">
                {loading ? (
                    <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
                ) : filteredItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{emptyText}</p>
                ) : filteredItems.map((item) => (
                    <label
                        key={item.id}
                        className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted/60"
                    >
                        <Checkbox
                            checked={selectedIds.includes(item.id)}
                            disabled={loading}
                            onCheckedChange={() => onToggle(item.id)}
                            className="mt-0.5"
                        />
                        <span className="min-w-0">
                            <span className="block truncate">{item.label}</span>
                            {item.caption ? (
                                <span className="block truncate text-xs text-muted-foreground">{item.caption}</span>
                            ) : null}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}
