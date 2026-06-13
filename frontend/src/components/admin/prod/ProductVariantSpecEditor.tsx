import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

type SpecItem = {
    specKey: string;
    specValue: string;
};

type Props = {
    specs: SpecItem[];
    onChange: (specs: SpecItem[]) => void;
};

export default function ProductVariantSpecEditor({ specs, onChange }: Props) {
    function addSpec() {
        onChange([
            ...specs, 
            { 
                specKey: "", 
                specValue: ""
            }
        ]);
    }

    function updateSpec(index: number, field: keyof SpecItem, value: string) {
        onChange(
            specs.map((item, itemIndex) => 
                itemIndex === index ? {...item, [field]: value} : item
            )
        );
    }

    function removeSpec(index: number) {
        onChange(
            specs.filter((_, itemIndex) => itemIndex !== index)
        );
    }

    return (
        <div className="rounded-lg border bg-background p-5">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Thông số kỹ thuật</h2>

                <Button type="button" variant="outline" onClick={addSpec} className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm thông số
                </Button>
            </div>

            <div className="mt-4 space-y-3">
                {specs.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        Chưa có thông số kỹ thuật.
                    </div>
                ): (
                    specs.map((spec, index) => (
                        <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                            <Input 
                                value={spec.specKey}
                                onChange={(e) => updateSpec(index, "specKey", e.target.value)}
                                placeholder="Ví dụ: Màn hình"
                            />

                            <Input 
                                value={spec.specValue}
                                onChange={(e) => updateSpec(index, "specValue", e.target.value)}
                                placeholder="Ví dụ: 6.7 inch"
                            />

                            <Button
                                type="button"
                                variant={"destructive"}
                                size={"icon"}
                                onClick={() => removeSpec(index)}
                                className="cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}