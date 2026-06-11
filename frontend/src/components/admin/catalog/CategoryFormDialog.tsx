import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categoryService } from "@/services/category.service";
import type { Category } from "@/types/category.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    category?: Category | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

export default function CategoryFormDialog({
    open,
    category,
    onOpenChange,
    onSuccess
}: Props) {
    const [categoryName, setCategoryName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isEdit = Boolean(category);

    useEffect(() => {
        if(open){
            setCategoryName(category?.category_name ?? "");
            setDescription(category?.description ?? "");
        }
    }, [open, category]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if(!categoryName.trim()){
            setError("Vui lòng nhập tên danh mục");
            return;
        }

        try{
            setLoading(true);
            setError("");

            if(isEdit && category){
                await categoryService.update(category.category_id, {
                    categoryName: categoryName.trim(),
                    description: description.trim() || undefined,
                });
                toast.success("Cập nhật danh mục thành công");
            }else {
                await categoryService.create({
                    categoryName: categoryName.trim(),
                    description: description.trim() || undefined,
                });
                toast.success("Tạo danh mục thành công");
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
                        {isEdit ? "Cập nhật danh mục" : "Thêm danh mục"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormError message={error} />

                    <div className="space-y-2">
                        <Label>Tên danh mục</Label>
                        <Input 
                            value={categoryName}
                            onChange={(event) => setCategoryName(event.target.value)}
                            placeholder="Ví dụ: Laptop"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Mô tả</Label>
                        <Textarea 
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Mô tả ngắn về danh mục"
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