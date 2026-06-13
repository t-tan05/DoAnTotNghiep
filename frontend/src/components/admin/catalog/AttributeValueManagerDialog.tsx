import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { attributeValueService } from "@/services/attributeValue.service";
import type { ProductAttributeValue } from "@/types/attribute-value.type";
import type { ProductAttribute } from "@/types/product-attribute.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    attribute: ProductAttribute | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void | Promise<void>;
};

export default function AttributeValueManagerDialog({
    open,
    attribute,
    onOpenChange,
    onSuccess,
}: Props) {
    const [value, setValue] = useState("");
    const [displayOrder, setDisplayOrder] = useState("0");
    const [editingValue, setEditingValue] = useState<ProductAttributeValue | null>(null);
    const [deleteValue, setDeleteValue] = useState<ProductAttributeValue | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false); 

    useEffect(() => {
        if(!open) return;

        setValue("");
        setDisplayOrder("0");
        setEditingValue(null);
        setDeleteValue(null);
        setError("");
    }, [open]);

    if(!attribute) return null;

    function startEdit(item: ProductAttributeValue) {
        setEditingValue(item);
        setValue(item.value);
        setDisplayOrder(String(item.display_order ?? 0));
        setError("");
    }

    function resetForm() {
        setEditingValue(null);
        setValue("");
        setDisplayOrder("0");
        setError("");
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if(!attribute) return;

        if(!value.trim()) {
            setError("Vui lòng nhập giá trị thuộc tính.");
            return;
        }

        try {
            setLoading(true);

            if(editingValue) {
                await attributeValueService.update(editingValue.attribute_value_id, {
                    value: value.trim(),
                    displayOrder: Number(displayOrder),
                });
                toast.success("Cập nhật giá trị thành công.");
            } else {
                await attributeValueService.create({
                    values: [
                        {
                            attributeId: attribute.attribute_id,
                            value: value.trim(),
                            displayOrder: Number(displayOrder),
                        },
                    ],
                });
                toast.success("Thêm giá trị thành công.");
            }

            resetForm();
            await onSuccess();
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    async function handleConfirmDelete() {
        if(!deleteValue) return;

        try {
            setDeleting(true);
            await attributeValueService.remove(deleteValue.attribute_value_id);
            toast.success("Xóa giá trị thành công.");
            setDeleteValue(null);
            await onSuccess();
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setDeleting(false);
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] overflow-y-auto sm:!max-w-3xl lg:!max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Quản lý giá trị: {attribute.attribute_name}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
                        <FormError message={error} />

                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px_auto] lg:items-end">
                            <div className="space-y-2">
                                <Label>Giá trị</Label>
                                <Input
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="Ví dụ: 16GB, Đen, 512GB"
                                    className="min-w-0"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Thứ tự</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={displayOrder}
                                    onChange={(e) => setDisplayOrder(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                                <SpinnerButton type="submit" loading={loading} loadingText="Đang lưu..." className="min-w-[96px] cursor-pointer">
                                    {editingValue ? "Cập nhật" : "Thêm"}
                                </SpinnerButton>

                                {editingValue && (
                                    <Button type="button" variant="outline" onClick={resetForm} className="cursor-pointer">
                                        Hủy
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>

                    <div className="space-y-2">
                        {attribute.attribute_values.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                Chưa có giá trị nào.
                            </div>
                        ) : (
                            attribute.attribute_values.map((item) => (
                                <div
                                    key={item.attribute_value_id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div>
                                        <p className="font-medium">{item.value}</p>
                                        <p className="text-xs text-muted-foreground">Thứ tự: {item.display_order}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" type="button" onClick={() => startEdit(item)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button variant="destructive" size="icon" type="button" onClick={() => setDeleteValue(item)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDeleteDialog
                open={Boolean(deleteValue)}
                loading={deleting}
                title="Xóa giá trị thuộc tính"
                description={`Bạn có chắc muốn xóa giá trị "${deleteValue?.value}" không?`}
                onOpenChange={(open) => {
                    if(!open) setDeleteValue(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </>
    )
}