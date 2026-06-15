import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { promotionService } from "@/services/promotion.service";
import type { Promotion, PromotionDiscountType } from "@/types/promotion.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    promotion?: Promotion | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

function toDateTimeLocal(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
}

function toISOStringFromLocal(value: string) {
    return new Date(value).toISOString();
}

export default function PromotionFormDialog({
    open,
    promotion,
    onOpenChange,
    onSuccess,
}: Props) {
    const isEdit = Boolean(promotion);

    const [form, setForm] = useState({
        promotionName: "",
        description: "",
        discountType: "PERCENT" as PromotionDiscountType,
        discountValue: "",
        startDate: "",
        endDate: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        setForm({
            promotionName: promotion?.promotion_name ?? "",
            description: promotion?.description ?? "",
            discountType: promotion?.discount_type ?? "PERCENT",
            discountValue: promotion ? String(promotion.discount_value) : "",
            startDate: toDateTimeLocal(promotion?.start_date),
            endDate: toDateTimeLocal(promotion?.end_date),
        });
        setError("");
    }, [open, promotion]);

    function updateField(name: keyof typeof form, value: string) {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!form.promotionName.trim()) return setError("Vui lòng nhập tên khuyến mãi.");
        if (!form.discountValue || Number(form.discountValue) <= 0) return setError("Giá trị giảm phải lớn hơn 0.");
        if (!form.startDate) return setError("Vui lòng chọn ngày bắt đầu.");
        if (!form.endDate) return setError("Vui lòng chọn ngày kết thúc.");
        if (new Date(form.endDate) <= new Date(form.startDate)) {
            return setError("Ngày kết thúc phải sau ngày bắt đầu.");
        }

        try {
            setLoading(true);

            const payload = {
                promotionName: form.promotionName.trim(),
                description: form.description.trim() || null,
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                startDate: toISOStringFromLocal(form.startDate),
                endDate: toISOStringFromLocal(form.endDate),
            };

            if (isEdit && promotion) {
                await promotionService.update(promotion.promotion_id, payload);
                toast.success("Cập nhật khuyến mãi thành công.");
            } else {
                await promotionService.create(payload);
                toast.success("Tạo khuyến mãi thành công.");
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
            <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] overflow-y-auto sm:!max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormError message={error} />

                    <div className="space-y-2">
                        <Label>Tên khuyến mãi</Label>
                        <Input
                            value={form.promotionName}
                            onChange={(e) => updateField("promotionName", e.target.value)}
                            placeholder="Ví dụ: Sale hè 2026"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Loại giảm</Label>
                            <Select
                                value={form.discountType}
                                onValueChange={(value) => updateField("discountType", value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper" align="start">
                                    <SelectItem value="PERCENT">Phần trăm</SelectItem>
                                    <SelectItem value="FIXED">Số tiền cố định</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Giá trị giảm</Label>
                            <Input
                                type="number"
                                min={0}
                                value={form.discountValue}
                                onChange={(e) => updateField("discountValue", e.target.value)}
                                placeholder={form.discountType === "PERCENT" ? "10" : "500000"}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Ngày bắt đầu</Label>
                            <Input
                                type="datetime-local"
                                value={form.startDate}
                                onChange={(e) => updateField("startDate", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Ngày kết thúc</Label>
                            <Input
                                type="datetime-local"
                                value={form.endDate}
                                onChange={(e) => updateField("endDate", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Mô tả</Label>
                        <Textarea
                            value={form.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            placeholder="Mô tả ngắn về chương trình khuyến mãi"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)} className="cursor-pointer">
                            Hủy
                        </Button>

                        <SpinnerButton
                            type="submit"
                            loading={loading}
                            loadingText={isEdit ? "Đang cập nhật..." : "Đang tạo..."}
                            className="cursor-pointer"
                        >
                            {isEdit ? "Cập nhật" : "Tạo mới"}
                        </SpinnerButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}