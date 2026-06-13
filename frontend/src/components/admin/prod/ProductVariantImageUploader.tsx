import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

type PreviewImage = {
    name: string;
    url: string;
};

type Props = {
    files: File[];
    onChange: (files: File[]) => void;
};

export default function ProductVariantImageUploader({files, onChange}: Props) {
    const [previews, setPreviews] = useState<PreviewImage[]>([]);

    useEffect(() => {
        const nextPreviews = files.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
        }));

        setPreviews(nextPreviews);

        return () => {
            nextPreviews.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, [files]);

    return (
        <div className="rounded-lg border bg-background p-5">
            <h2 className="text-lg font-semibold">Ảnh biến thể</h2>

            <div className="mt-4 space-y-2">
                <Label>Chọn ảnh mới</Label>
                <Input 
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => onChange(Array.from(e.target.files ?? []))}
                />

                <p className="text-xs text-muted-foreground">
                    Ảnh đầu tiên sẽ được dùng làm ảnh mặc định khi tạo biến thể mới.
                </p>
            </div>

            {previews.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {previews.map((item) => (
                        <div key={item.url} className="overflow-hidden rounded-lg border bg-muted">
                            <img
                                src={item.url}
                                alt={item.name}
                                className="aspect-square w-full object-cover"
                            />
                            <p className="truncate px-2 py-1 text-xs">{item.name}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}