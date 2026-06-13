import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductAttribute } from "@/types/product-attribute.type";

type Props = {
    attributes: ProductAttribute[];
    selectedValueIds: string[];
    onChange: (valueIds: string[]) => void;
};

export default function ProductVariantAttributeSelector({
    attributes,
    selectedValueIds,
    onChange,
}: Props) {
    function handleSelect(attribute: ProductAttribute, valueId: string) {
        const valueIdsOfThisAttribute = attribute.attribute_values.map(
            (value) => value.attribute_value_id
        );

        const nextValueIds = selectedValueIds
            .filter((id) => !valueIdsOfThisAttribute.includes(id))
            .concat(valueId);

        onChange(nextValueIds);
    }

    if(attributes.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Chưa có thuộc tính nào. Hãy tạo thuộc tính trước khi tạo biến thể.
            </div>
        )
    }

    return (
        <div className="rounded-lg border bg-background p-5">
            <h2 className="text-lg font-semibold">Thuộc tính biến thể</h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                {attributes.map((attribute) => {
                    const selectedValue = attribute.attribute_values.find((value) => 
                    selectedValueIds.includes(value.attribute_value_id));

                    return (
                        <div key={attribute.attribute_id} className="space-y-2">
                            <Label>{attribute.attribute_name}</Label>

                            <Select
                                value={selectedValue?.attribute_value_id}
                                onValueChange={(value) => handleSelect(attribute, value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={`Chọn ${attribute.attribute_name}`} />
                                </SelectTrigger>

                                <SelectContent position="popper" align="start">
                                    {attribute.attribute_values.map((value) => (
                                        <SelectItem
                                            key={value.attribute_value_id}
                                            value={value.attribute_value_id}
                                        >
                                            {value.value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}