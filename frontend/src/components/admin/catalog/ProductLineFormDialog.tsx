import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
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
import { productLineService } from "@/services/productLine.service";
import type { Brand } from "@/types/brand.type";
import type { Category } from "@/types/category.type";
import type { ProductLine } from "@/types/product-line.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    productLine?: ProductLine | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

export default function ProductLineFormDialog({
    open,
    productLine,
    onOpenChange,
    onSuccess,
}: Props) {
    const isEdit = Boolean(productLine);

    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        lineName: "",
        brandId: "",
        categoryId: "",
        description: "",
        imageUrl: "",
        displayOrder: "0",
        isActive: "true",
    });

    useEffect(() => {
        if(!open) return;

        setForm({
            lineName: productLine?.line_name ?? "",
            brandId: productLine?.brand_id ?? "",
            categoryId: productLine?.category_id ?? "",
            description: productLine?.description ?? "",
            imageUrl: productLine?.image_url ?? "",
            displayOrder: String(productLine?.display_order ?? 0),
            isActive: productLine?.is_active === false ? "false" : "true",
        });
        setError("");
    }, [open, productLine]);

    useEffect(() => {
        if(!open) return;

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

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if(!form.lineName.trim()) return setError("Vui lòng nhập tên dòng sản phẩm.");
        if(!form.brandId) return setError("Vui lòng chọn thương hiệu.");
        if(!form.categoryId) return setError("Vui lòng chọn danh mục.");

        try {
            setLoading(true);

            const payload = {
                lineName: form.lineName.trim(),
                brandId: form.brandId,
                categoryId: form.categoryId,
                description: form.description.trim() || null,
                imageUrl: form.imageUrl.trim() || null,
                displayOrder: Number(form.displayOrder || 0),
                isActive: form.isActive === "true",
            };

            if(isEdit && productLine) {
                await productLineService.update(productLine.line_id, payload);
                toast.success("Cập nhật dòng sản phẩm thành công.");
            }else {
                await productLineService.create(payload);
                toast.success("Tạo dòng sản phẩm thành công.");
            }

            onOpenChange(false);
            onSuccess();
        } catch(error) {
            const message = getErrorMessage(error);
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Cập nhật dòng sản phẩm" : "Thêm dòng sản phẩm"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormError message={error} />

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label>Tên dòng sản phẩm</Label>
                            <Input
                                value={form.lineName}
                                onChange={(event) => updateField("lineName", event.target.value)}
                                placeholder="Ví dụ: ASUS ROG Gaming"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Thương hiệu</Label>
                            <Select
                                value={form.brandId}
                                disabled={loadingOptions}
                                onValueChange={(value) => updateField("brandId", value)}
                            >
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue placeholder="Chọn thương hiệu" />
                                </SelectTrigger>
                                <SelectContent>
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
                                disabled={loadingOptions}
                                onValueChange={(value) => updateField("categoryId", value)}
                            >
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.category_id} value={category.category_id}>
                                            {category.category_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Thứ tự hiển thị</Label>
                            <Input
                                type="number"
                                min={0}
                                value={form.displayOrder}
                                onChange={(event) => updateField("displayOrder", event.target.value)}
                            />
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

                        <div className="space-y-2 md:col-span-2">
                            <Label>Ảnh dòng sản phẩm</Label>
                            <Input
                                value={form.imageUrl}
                                onChange={(event) => updateField("imageUrl", event.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Mô tả</Label>
                        <Textarea
                            value={form.description}
                            onChange={(event) => updateField("description", event.target.value)}
                            placeholder="Mô tả ngắn về dòng sản phẩm"
                        />
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
