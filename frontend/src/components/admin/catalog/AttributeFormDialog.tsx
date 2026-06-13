import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productAttributeService } from "@/services/productAttribute.service";
import type { ProductAttribute } from "@/types/product-attribute.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    attribute?: ProductAttribute | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

export default function AttributeFormDialog({
    open,
    attribute,
    onOpenChange,
    onSuccess,
}: Props) {
    const [attributeName, setAttributeName] = useState("");
    const [displayOrder, setDisplayOrder] = useState("0");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isEdit = Boolean(attribute);

    useEffect(() => {
        if(!open) return;

        setAttributeName(attribute?.attribute_name ?? "");
        setDisplayOrder(String(attribute?.display_order ?? 0));
        setError("");
    }, [open, attribute]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if(!attributeName.trim()) {
            setError("Vui lòng nhập tên thuộc tính.");
            return;
        }

        try {
            setLoading(true);

            if(isEdit && attribute) {
                await productAttributeService.update(attribute.attribute_id, {
                    attributeName: attributeName.trim(),
                    displayOrder: Number(displayOrder),
                });
                toast.success("Cập nhật thuộc tính thành công.");
            }else {
                await productAttributeService.create({
                    attributes: [
                        {
                            attributeName: attributeName.trim(),
                            displayOrder: Number(displayOrder),
                        },
                    ],
                });
                toast.success("Tạo thuộc tính thành công.");
            }

            onOpenChange(false);
            onSuccess();
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Cập nhật thuộc tính" : "Thêm thuộc tính"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormError message={error}/>

                    <div className="space-y-2">
                        <Label>Tên thuộc tính</Label>
                        <Input 
                            value={attributeName}
                            onChange={(e) => setAttributeName(e.target.value)}
                            placeholder="Ví dụ: Màu sắc, RAM, SSD"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Thứ tự hiển thị</Label>
                        <Input 
                            type="number"
                            min={0}
                            value={displayOrder}
                            onChange={(e) => setDisplayOrder(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button 
                            type="button" 
                            variant="outline" 
                            disabled={loading} 
                            onClick={() => onOpenChange(false)}
                            className="cursor-pointer"
                        >
                            Hủy
                        </Button>

                        <SpinnerButton 
                            type="submit" 
                            loading={loading} 
                            loadingText={isEdit ? "Đang cập nhật..." : "Đang tạo..."}
                            className={loading ? "cursor-not-allowed" : "cursor-pointer"}
                        >
                            {isEdit ? "Cập nhật" : "Tạo mới"}
                        </SpinnerButton>
                    </DialogFooter>
                </form>
            </DialogContent>

        </Dialog>
    )
}