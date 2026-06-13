import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { productService } from "@/services/product.service";
import type { Brand } from "@/types/brand.type";
import type { Category } from "@/types/category.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    brands: Brand[];
    categories: Category[];
    onOpenChange: (open: boolean) => void;
    onSuccess: (productId: string) => void;
};

export default function ProductCreateDialog({
    open,
    brands,
    categories,
    onOpenChange,
    onSuccess,
}: Props) {
    const [form, setForm] = useState({
        productName: "",
        brandId: "",
        categoryId: "",
        warrantyPeriod: "12",
        description: "",
    });

    const [error, setError] = useState("");
    const [loading ,setLoading] = useState(false);

    function updateField(name: keyof typeof form, value: string) {
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if(!form.productName.trim()) return setError("Vui lòng nhập tên sản phẩm.");
        if(!form.brandId) return setError("Vui lòng chọn thương hiệu.");
        if(!form.categoryId) return setError("Vui lòng chọn danh mục.");

        try{
            setLoading(true);

            const res = await productService.create({
                productName: form.productName.trim(),
                brandId: form.brandId,
                categoryId: form.categoryId,
                warrantyPeriod: Number(form.warrantyPeriod),
                description: form.description.trim() || null,
            });

            const productId = res.data?.newProduct?.product_id;
            if(!productId) throw new Error("Backend không trả product_id.");

            toast.success("Tạo sản phẩm thành công.");
            onSuccess(productId);

            setForm({
                productName: "",
                brandId: "",
                categoryId: "",
                warrantyPeriod: "12",
                description: "",
            });
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        Thêm sản phẩm
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormError message={error}/>

                    <div className="space-y-2">
                        <Label>Tên sản phẩm</Label>
                        <Input 
                            value={form.productName}
                            onChange={(e) => updateField("productName", e.target.value)}
                            placeholder="Ví dụ: Laptop Dell XPS 13"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Thương hiệu</Label>
                            <Select value={form.brandId} onValueChange={(value) => updateField("brandId", value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn thương hiệu"/>
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
                            <Select value={form.categoryId} onValueChange={(value) => updateField("categoryId", value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn danh mục"/>
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
                    </div>

                    <div className="space-y-2">
                        <Label>Bảo hành (tháng)</Label>
                        <Input 
                            type="number"
                            min={0}
                            value={form.warrantyPeriod}
                            onChange={(e) => updateField("warrantyPeriod", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Mô tả</Label>
                        <Textarea 
                            value={form.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            placeholder="Mô tả ngắn về sản phẩm"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant={"outline"}
                            disabled={loading}
                            onClick={() => onOpenChange(false)}
                            className="cursor-pointer"
                        >
                            Hủy
                        </Button>
                        <SpinnerButton
                            type="submit"
                            loading={loading}
                            loadingText="Đang tạo..."
                            className={loading ? "cursor-not-allowed" : "cursor-pointer"}
                        >
                            Tạo sản phẩm
                        </SpinnerButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}