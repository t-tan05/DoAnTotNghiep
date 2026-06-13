import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

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

    function handleRemove(index: number) {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onChange(newFiles);
    }

    return (
        <div className="rounded-lg border bg-background p-5">
            <h2 className="text-lg font-semibold">Ảnh biến thể</h2>

            <div className="mt-4 space-y-2">
                <Label>Chọn ảnh mới</Label>
                <Input 
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                        const newFiles = Array.from(e.target.files ?? []);
                        onChange([...files, ...newFiles]);
                        e.target.value = "";
                    }}
                />

                <p className="text-xs text-muted-foreground">
                    Ảnh đầu tiên sẽ được dùng làm ảnh mặc định khi tạo biến thể mới.
                </p>
            </div>

            {previews.length > 0 && (
                <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {previews.map((item, index) => (
                        <div key={item.url} className="relative overflow-hidden rounded-lg border bg-muted">
                            <img
                                src={item.url}
                                alt={item.name}
                                className="aspect-square w-full object-cover"
                            />
                            <p className="truncate px-2 py-1 text-xs">{item.name}</p>
                            
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}