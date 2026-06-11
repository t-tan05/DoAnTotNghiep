import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { brandService } from "@/services/brand.service";
import type { Brand } from "@/types/brand.type";
import { getErrorMessage } from "@/utils/getErrorMessage";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    brand?: Brand | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

export default function BrandFormDialog({
    open,
    brand,
    onOpenChange,
    onSuccess,
}: Props) {
    const [brandName, setBrandName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isEdit = Boolean(brand);

    useEffect(() => {
        if(open) {
            setBrandName(brand?.brand_name ?? "");
            setDescription(brand?.description ?? "");
        }
    }, [open, brand]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if(!brandName.trim()) {
            setError("Vui lòng nhập tên thương hiệu");
            return;
        }

        try {
            setLoading(true);
            setError("");

            if(isEdit && brand) {
                await brandService.update(brand.brand_id, {
                    brandName: brandName.trim(),
                    description: description.trim() || undefined,
                });
                toast.success("Cập nhật thương hiệu thành công");
            }else {
                await brandService.create({
                    brandName: brandName.trim(),
                    description: description.trim() || undefined,
                });
                toast.success("Tạo thương hiệu thành công");
            }

            onOpenChange(false);
            onSuccess();
        }catch(error) {
            toast.error(getErrorMessage(error));
        }finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Cập nhật thương hiệu" : "Thêm thương hiệu"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormError message={error} />

                    <div className="space-y-2">
                        <Label>Tên thương hiệu</Label>
                        <Input 
                            value={brandName}
                            onChange={(event) => setBrandName(event.target.value)}
                            placeholder="Ví dụ: Apple"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Mô tả</Label>
                        <Textarea 
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Mô tả ngắn về thương hiệu"
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
};