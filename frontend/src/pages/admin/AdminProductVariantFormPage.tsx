import ProductVariantAttributeSelector from "@/components/admin/prod/ProductVariantAttributeSelector";
import ProductVariantImageGallery from "@/components/admin/prod/ProductVariantImageGallery";
import ProductVariantImageUploader from "@/components/admin/prod/ProductVariantImageUploader";
import ProductVariantSpecEditor from "@/components/admin/prod/ProductVariantSpecEditor";
import FormError from "@/components/common/FormError";
import PageLoading from "@/components/common/PageLoading";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productService } from "@/services/product.service";
import { productAttributeService } from "@/services/productAttribute.service";
import { productImageService } from "@/services/productImage.service";
import { productVariantService } from "@/services/productVariant.service";
import type { ProductAttribute } from "@/types/product-attribute.type";
import type { AdminProduct } from "@/types/product.type";
import type { AdminProductVariant } from "@/types/productVariant.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

type SpecItem = {
    specKey: string;
    specValue: string;
};

export default function AdminProductVariantFormPage() {

    const { productId, variantId } = useParams();
    const navigate = useNavigate();

    const isEdit = Boolean(variantId);

    const [product, setProduct] = useState<AdminProduct | null>(null);
    const [variant, setVariant] = useState<AdminProductVariant | null>(null);
    const [attributes, setAttributes] = useState<ProductAttribute[]>([]);

    const [form, setForm] = useState({
        sku: "",
        price: "",
        quantityInStock: "0",
        stockNote: "",
    });

    const [selectedAttributeValueIds, setSelectedAttributeValueIds] = useState<string[]>([]);
    const [specs, setSpecs] = useState<SpecItem[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    function updateField(name: keyof typeof form, value: string){
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function loadVariant(currentVariantId: string) {
        const data = await productVariantService.getById(currentVariantId);
        const loadedVariant = data.productVariant as AdminProductVariant;

        setVariant(loadedVariant);

        setForm({
            sku: loadedVariant.sku ?? "",
            price: String(loadedVariant.price ?? ""),
            quantityInStock: String(loadedVariant.quantity_in_stock ?? 0),
            stockNote: "",
        });

        setSelectedAttributeValueIds(
            loadedVariant.variant_attribute_values?.map((item) =>
                item.attribute_value_id || item.attribute_values.attribute_value_id
            ) ?? []
        );

        setSpecs(
            loadedVariant.product_variant_specs?.map((item) => ({
                specKey: item.spec_key,
                specValue: item.spec_value,
            })) ?? []
        );
    }

    async function loadData() {
        if(!productId) return;

        try{
            setLoading(true);
            setError("");

            const [productData, attributeData] = await Promise.all([
                productService.getById(productId),
                productAttributeService.getAll(),
            ]);

            setProduct(productData?.product ?? null);
            setAttributes(attributeData?.productAttributes ?? []);

            if(variantId){
                await loadVariant(variantId);
            }
        }catch(error){
            setError(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [productId, variantId]);

    function validateForm() {
        if (!form.sku.trim()) return "Vui lòng nhập SKU.";
        if (!form.price || Number(form.price) <= 0) return "Giá phải lớn hơn 0.";
        if (form.quantityInStock === "" || Number(form.quantityInStock) < 0) {
            return "Tồn kho không hợp lệ.";
        }

        const validSpecs = specs.filter((item) => item.specKey.trim() || item.specValue.trim());
        const hasInvalidSpec = validSpecs.some((item) => !item.specKey.trim() || !item.specValue.trim());

        if (hasInvalidSpec) return "Thông số kỹ thuật phải nhập đủ tên và giá trị.";

        return "";
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const message = validateForm();
        if(message) {
            setError(message);
            return;
        }

        if(!productId) return;

        const cleanSpecs = specs
            .filter((item) => item.specKey.trim() && item.specValue.trim())
            .map((item) => ({
                specKey: item.specKey.trim(),
                specValue: item.specValue.trim(),
            }));

        try{
            setSaving(true);
            setError("");

            if(isEdit && variantId) {
                await productVariantService.update(variantId, {
                    sku: form.sku.trim(),
                    price: Number(form.price),
                    quantityInStock: Number(form.quantityInStock),
                    stockNote: form.stockNote.trim() || null,
                    attributeValueIds: selectedAttributeValueIds,
                    specs: cleanSpecs,
                });

                if(newImages.length > 0) {
                    await productImageService.addVariantImages(variantId, newImages);
                }

                toast.success("Cập nhật biến thể thành công.");
            }else {
                if(newImages.length > 0) {
                    const formData = new FormData();

                    formData.append("data", JSON.stringify({
                        variants: [
                            {
                                sku: form.sku.trim(),
                                price: Number(form.price),
                                quantityInStock: Number(form.quantityInStock),
                                attributeValueIds: selectedAttributeValueIds,
                                specs: cleanSpecs,
                            },
                        ],
                    }));

                    newImages.forEach((file, index) => {
                        formData.append(`variant_0_image_${index}`, file);
                    });

                    await productVariantService.create(productId, formData);
                }else {
                    await productVariantService.create(productId, {
                        variants: [
                            {
                                sku: form.sku.trim(),
                                price: Number(form.price),
                                quantityInStock: Number(form.quantityInStock),
                                attributeValueIds: selectedAttributeValueIds,
                                specs: cleanSpecs,
                            },
                        ],
                    });
                }

                toast.success("Tạo biến thể thành công.");
            }

            navigate(`/admin/products/${productId}`);
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setSaving(false);
        }
    }

    if (loading) return <PageLoading text="Đang tải dữ liệu biến thể..." />;
    if (error && !product) return <FormError message={error} />;
    if (!product) return <p>Không tìm thấy sản phẩm.</p>;


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <Button
                        type="button"
                        variant="ghost"
                        className="mb-2 px-0 cursor-pointer"
                        onClick={() => navigate(`/admin/products/${productId}`)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>

                    <h1 className="text-2xl font-semibold tracking-tight">
                        {isEdit ? "Chỉnh sửa biến thể" : "Thêm biến thể"}
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Sản phẩm: {product.product_name}
                    </p>
                </div>

                <SpinnerButton
                    type="submit"
                    loading={saving}
                    loadingText={isEdit ? "Đang cập nhật..." : "Đang tạo..."}
                    className={saving ? "cursor-not-allowed" : "cursor-pointer h-12"}
                >
                    {isEdit ? "Cập nhật biến thể" : "Tạo biến thể"}
                </SpinnerButton>
            </div>

            <FormError message={error} />

            <div className="space-y-6">
                <div className="rounded-lg border bg-background p-5">
                    <h2 className="text-lg font-semibold">Thông tin cơ bản</h2>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>SKU</Label>
                            <Input
                                value={form.sku}
                                onChange={(e) => updateField("sku", e.target.value)}
                                placeholder="Ví dụ: IP15PM-WHITE-256"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Giá</Label>
                            <Input
                                type="number"
                                min={0}
                                value={form.price}
                                onChange={(e) => updateField("price", e.target.value)}
                                placeholder="29990000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Tồn kho</Label>
                            <Input
                                type="number"
                                min={0}
                                value={form.quantityInStock}
                                onChange={(e) => updateField("quantityInStock", e.target.value)}
                            />
                        </div>
                    </div>

                    {isEdit && (
                        <div className="mt-4 space-y-2">
                            <Label>Ghi chú điều chỉnh kho</Label>
                            <Input
                                value={form.stockNote}
                                onChange={(e) => updateField("stockNote", e.target.value)}
                                placeholder="Ví dụ: Kiểm kho cuối tháng"
                            />
                        </div>
                    )}
                </div>

                <ProductVariantAttributeSelector
                    attributes={attributes}
                    selectedValueIds={selectedAttributeValueIds}
                    onChange={setSelectedAttributeValueIds}
                />

                <ProductVariantSpecEditor
                    specs={specs}
                    onChange={setSpecs}
                />

                {isEdit && (
                    <ProductVariantImageGallery
                        variant={variant}
                        onChanged={async () => {
                            if (variantId) await loadVariant(variantId);
                        }}
                    />
                )}

                <ProductVariantImageUploader
                    files={newImages}
                    onChange={setNewImages}
                />
            </div>
        </form>
    )
}