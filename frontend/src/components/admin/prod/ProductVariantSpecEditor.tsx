import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

type SpecItem = {
    specKey: string;
    specValue: string;
};

type SpecImportSource = {
    variantId: string;
    label: string;
    specs: SpecItem[];
};

type Props = {
    specs: SpecItem[];
    onChange: (specs: SpecItem[]) => void;
    importSources?: SpecImportSource[];
};

export default function ProductVariantSpecEditor({
    specs,
    onChange,
    importSources = [],
}: Props) {
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

    function importSpecs(sourceVariantId: string) {
        if(!sourceVariantId) return;

        const source = importSources.find((item) => item.variantId === sourceVariantId);
        if(!source) return;

        onChange(
            source.specs.map((item) => ({
                specKey: item.specKey,
                specValue: item.specValue,
            }))
        );
    }

    return (
        <div className="rounded-lg border bg-background p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-lg font-semibold">Thông số kỹ thuật</h2>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    {importSources.length > 0 && (
                        <select
                            defaultValue=""
                            onChange={(event) => {
                                importSpecs(event.target.value);
                                event.target.value = "";
                            }}
                            className="h-10 min-w-[280px] cursor-pointer rounded-md border bg-background px-3 text-sm"
                        >
                            <option value="">Lấy thông số từ biến thể khác...</option>
                            {importSources.map((source) => (
                                <option key={source.variantId} value={source.variantId}>
                                    {source.label}
                                </option>
                            ))}
                        </select>
                    )}

                <Button type="button" variant="outline" onClick={addSpec} className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm thông số
                </Button>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {specs.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        Chưa có thông số kỹ thuật.
                    </div>
                ): (
                    specs.map((spec, index) => (
                        <div key={index} className="grid items-start gap-3 md:grid-cols-[1fr_1fr_auto]">
                            <Input 
                                value={spec.specKey}
                                onChange={(e) => updateSpec(index, "specKey", e.target.value)}
                                placeholder="Ví dụ: Màn hình"
                            />

                            <Textarea
                                value={spec.specValue}
                                onChange={(e) => updateSpec(index, "specValue", e.target.value)}
                                placeholder={"Ví dụ:\n1 x USB Type C / DisplayPort\n3 x USB 3.2\nAudio combo"}
                                className="min-h-10 resize-y"
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
