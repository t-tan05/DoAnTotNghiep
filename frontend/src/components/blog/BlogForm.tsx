import FormError from "@/components/common/FormError";
import RichTextEditor from "@/components/common/RichTextEditor";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Blog, BlogPayload, BlogStatus } from "@/types/blog.type";
import { useEffect, useState } from "react";

type Props = {
    blog?: Blog | null;
    loading?: boolean;
    error?: string;
    onCancel: () => void;
    onSubmit: (payload: BlogPayload) => void;
};

export default function BlogForm({
    blog,
    loading,
    error,
    onCancel,
    onSubmit,
}: Props) {
    const [form, setForm] = useState({
        title: "",
        content: "",
        thumbnailUrl: "",
        status: "DRAFT" as BlogStatus,
    });

    useEffect(() => {
        setForm({
            title: blog?.title ?? "",
            content: blog?.content ?? "",
            thumbnailUrl: blog?.thumbnail_url ?? "",
            status: blog?.status ?? "DRAFT",
        });
    }, [blog]);

    function updateField(name: keyof typeof form, value: string) {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        onSubmit({
            title: form.title.trim(),
            content: form.content.trim(),
            thumbnailUrl: form.thumbnailUrl.trim() || null,
            status: form.status,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border bg-background p-5">
            <FormError message={error || ""} />

            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label>Tiêu đề</Label>
                        <Input
                            value={form.title}
                            onChange={(event) => updateField("title", event.target.value)}
                            placeholder="Nhập tiêu đề bài viết"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Nội dung</Label>
                        <RichTextEditor
                            value={form.content}
                            onChange={(value) => updateField("content", value)}
                            placeholder="Nhập nội dung bài viết"
                        />
                    </div>
                </div>

                <aside className="space-y-5 rounded-lg border bg-muted/20 p-4">
                    <div className="space-y-2">
                        <Label>URL ảnh đại diện</Label>
                        <Input
                            value={form.thumbnailUrl}
                            onChange={(event) => updateField("thumbnailUrl", event.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    {form.thumbnailUrl && (
                        <img
                            src={form.thumbnailUrl}
                            alt="Thumbnail preview"
                            className="aspect-video w-full rounded-lg border object-cover"
                        />
                    )}

                    <div className="space-y-2">
                        <Label>Trạng thái</Label>
                        <Select
                            value={form.status}
                            onValueChange={(value) => updateField("status", value as BlogStatus)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start">
                                <SelectItem value="DRAFT">Bản nháp</SelectItem>
                                <SelectItem value="PUBLISHED">Public</SelectItem>
                                <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </aside>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" disabled={loading} onClick={onCancel} className="cursor-pointer">
                    Hủy
                </Button>

                <SpinnerButton type="submit" loading={Boolean(loading)} loadingText="Đang lưu..." className="cursor-pointer">
                    Lưu bài viết
                </SpinnerButton>
            </div>
        </form>
    );
}
