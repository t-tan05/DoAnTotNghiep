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
import { cmsService } from "@/services/cms.service";
import type { CmsSection, CmsSectionType } from "@/types/cms.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    collectionId: string;
    section?: CmsSection | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

const sectionTypes: Array<{ value: CmsSectionType; label: string }> = [
    { value: "BANNER", label: "Banner" },
    { value: "SHORTCUT_BUTTONS", label: "Nút lọc nhanh" },
    { value: "SHORTCUT_CARDS", label: "Thẻ danh mục" },
    { value: "FEATURED_PRODUCTS", label: "Sản phẩm nổi bật" },
    { value: "BLOG_GRID", label: "Tin công nghệ" },
    { value: "PRODUCT_GRID", label: "Lưới sản phẩm" },
];

export default function CmsSectionFormDialog({
    open,
    collectionId,
    section,
    onOpenChange,
    onSuccess,
}: Props) {
    const isEdit = Boolean(section);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        title: "",
        sectionType: "FEATURED_PRODUCTS" as CmsSectionType,
        subtitle: "",
        href: "",
        backgroundImage: "",
        sortOrder: "0",
        isActive: "true",
    });

    useEffect(() => {
        if(!open) return;

        setForm({
            title: section?.title ?? "",
            sectionType: section?.section_type ?? "FEATURED_PRODUCTS",
            subtitle: section?.subtitle ?? "",
            href: section?.href ?? "",
            backgroundImage: section?.background_image ?? "",
            sortOrder: String(section?.sort_order ?? 0),
            isActive: section?.is_active === false ? "false" : "true",
        });
        setError("");
    }, [open, section]);

    function updateField(name: keyof typeof form, value: string) {
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if(!form.sectionType) return setError("Vui lòng chọn loại khu vực.");

        try {
            setLoading(true);

            const payload = {
                title: form.title.trim(),
                sectionType: form.sectionType,
                subtitle: form.subtitle.trim() || null,
                href: form.href.trim() || null,
                backgroundImage: form.backgroundImage.trim() || null,
                sortOrder: Number(form.sortOrder || 0),
                isActive: form.isActive === "true",
            };

            if(isEdit && section) {
                await cmsService.updateSection(section.section_id, payload);
                toast.success("Cập nhật khu vực thành công.");
            } else {
                await cmsService.createSection(collectionId, payload);
                toast.success("Tạo khu vực thành công.");
            }

            onOpenChange(false);
            onSuccess();
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Cập nhật khu vực" : "Thêm khu vực"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormError message={error} />

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Tiêu đề</Label>
                            <Input value={form.title} onChange={(event) => updateField("title", event.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Loại khu vực</Label>
                            <Select value={form.sectionType} onValueChange={(value) => updateField("sectionType", value)}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectionTypes.map((item) => (
                                        <SelectItem key={item.value} value={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Link xem tất cả</Label>
                            <Input value={form.href} onChange={(event) => updateField("href", event.target.value)} placeholder="/c/laptop-gaming" />
                        </div>

                        <div className="space-y-2">
                            <Label>Ảnh nền</Label>
                            <Input value={form.backgroundImage} onChange={(event) => updateField("backgroundImage", event.target.value)} placeholder="https://..." />
                        </div>

                        <div className="space-y-2">
                            <Label>Thứ tự</Label>
                            <Input type="number" value={form.sortOrder} onChange={(event) => updateField("sortOrder", event.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select value={form.isActive} onValueChange={(value) => updateField("isActive", value)}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Đang bật</SelectItem>
                                    <SelectItem value="false">Đang tắt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Mô tả phụ</Label>
                        <Textarea value={form.subtitle} onChange={(event) => updateField("subtitle", event.target.value)} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <SpinnerButton type="submit" loading={loading} loadingText="Đang lưu...">
                            {isEdit ? "Cập nhật" : "Tạo mới"}
                        </SpinnerButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
