import AttributeFormDialog from "@/components/admin/catalog/AttributeFormDialog";
import AttributeValueManagerDialog from "@/components/admin/catalog/AttributeValueManagerDialog";
import type { AdminColumn } from "@/components/admin/table/AdminDataTable";
import AdminDataTable from "@/components/admin/table/AdminDataTable";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { productAttributeService } from "@/services/productAttribute.service";
import type { ProductAttribute } from "@/types/product-attribute.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Settings2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const VISIBLE_ATTRIBUTE_VALUES = 8;

const columns: AdminColumn<ProductAttribute>[] = [
    {
        key: "attribute_name",
        title: "Tên thuộc tính",
        render: (attribute) => attribute.attribute_name,
    },
    {
        key: "values",
        title: "Giá trị",
        headClassName: "min-w-[280px]",
        cellClassName: "max-w-[720px] whitespace-normal",
        render: (attribute) => {
            const values = attribute.attribute_values?.map((item) => item.value) ?? [];
            const visibleValues = values.slice(0, VISIBLE_ATTRIBUTE_VALUES);
            const hiddenCount = values.length - visibleValues.length;

            if(!values.length) {
                return <span className="text-muted-foreground">Chưa có giá trị</span>;
            }

            return (
                <div className="flex max-w-full flex-wrap gap-1.5 whitespace-normal" title={values.join(", ")}>
                    {visibleValues.map((value) => (
                        <Badge
                            key={value}
                            variant="outline"
                            className="max-w-[180px] truncate"
                        >
                            {value}
                        </Badge>
                    ))}

                    {hiddenCount > 0 ? (
                        <Badge variant="secondary">+{hiddenCount} giá trị</Badge>
                    ) : null}
                </div>
            );
        },
    },
    {
        key: "value_count",
        title: "Số giá trị",
        render: (attribute) => attribute.attribute_values?.length ?? 0,
    },
    {
        key: "display_order",
        title: "Thứ tự",
        render: (attribute) => attribute.display_order,
    },
];

export default function AdminProductAttributesPage(){
    const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState<ProductAttribute | null>(null);
    const [deleteAttribute, setDeleteAttribute] = useState<ProductAttribute | null>(null);
    const [manageValueAttributeId, setManageValueAttributeId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    async function fetchAttributes() {
        try {
            setLoading(true);
            const data = await productAttributeService.getAll();
            setAttributes(data?.productAttributes ?? []);
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAttributes();
    }, []);

    const manageValueAttribute = useMemo(() => {
        if(!manageValueAttributeId) return null;

        return attributes.find((attribute) => attribute.attribute_id === manageValueAttributeId) ?? null;
    }, [attributes, manageValueAttributeId]);

    const filteredAttributes = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if(!keyword) return attributes;

        return attributes.filter((attribute) =>
            attribute.attribute_name.toLowerCase().includes(keyword) ||
            attribute.attribute_values.some((item) => item.value.toLowerCase().includes(keyword))
        );
    }, [attributes, search]);

    async function handleConfirmDelete() {
        if(!deleteAttribute) return;

        try {
            setDeleting(true);

            await productAttributeService.remove(deleteAttribute.attribute_id);
            toast.success("Xóa thuộc tính thành công.");

            setDeleteAttribute(null);
            fetchAttributes();
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <AdminDataTable
                title="Quản lý thuộc tính"
                description="Quản lý thuộc tính sản phẩm và các giá trị như RAM, màu sắc, dung lượng."
                items={filteredAttributes}
                columns={columns}
                idKey="attribute_id"
                search={search}
                page={1}
                totalPages={1}
                sortBy=""
                sortOrder="asc"
                loading={loading}
                onSearchChange={setSearch}
                onPageChange={() => undefined}
                onSortChange={() => undefined}
                onAdd={() => {
                    setSelectedAttribute(null);
                    setOpenForm(true);
                }}
                onView={(attribute) => setManageValueAttributeId(attribute.attribute_id)}
                onEdit={(attribute) => {
                    setSelectedAttribute(attribute);
                    setOpenForm(true);
                }}
                onDelete={setDeleteAttribute}
            />

            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Settings2 className="h-4 w-4" />
                Bấm nút xem để quản lý các giá trị của thuộc tính.
            </p>

            <AttributeFormDialog
                open={openForm}
                attribute={selectedAttribute}
                onOpenChange={setOpenForm}
                onSuccess={fetchAttributes}
            />

            <AttributeValueManagerDialog
                open={Boolean(manageValueAttributeId)}
                attribute={manageValueAttribute}
                onOpenChange={(open) => {
                    if(!open) setManageValueAttributeId(null);
                }}
                onSuccess={fetchAttributes}
            />

            <ConfirmDeleteDialog
                open={Boolean(deleteAttribute)}
                loading={deleting}
                title="Xóa thuộc tính"
                description={`Bạn có chắc muốn xóa thuộc tính "${deleteAttribute?.attribute_name}" không?`}
                onOpenChange={(open) => {
                    if(!open) setDeleteAttribute(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
