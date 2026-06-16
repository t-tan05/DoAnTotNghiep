import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { productService, type ProductImportError } from "@/services/product.service";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

function getImportErrors(error: unknown) {
    if(
        typeof error === "object" &&
        error !== null &&
        "response" in error
    ) {
        const response = (error as {
            response?: {
                data?: {
                    data?: {
                        errors?: ProductImportError[];
                    };
                };
            };
        }).response;

        return response?.data?.data?.errors ?? [];
    }

    return [];
}

export default function ProductImportExcelDialog({
    open,
    onOpenChange,
    onSuccess,
}: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<ProductImportError[]>([]);

    function resetState() {
        setFile(null);
        setErrors([]);
    }

    async function handleSubmit() {
        if(!file) {
            toast.error("Vui lòng chọn file Excel.");
            return;
        }

        try {
            setLoading(true);
            setErrors([]);

            const data = await productService.importFromExcel(file);

            toast.success(
                `Import thành công ${data?.createdProductCount ?? 0} sản phẩm, ${data?.createdVariantCount ?? 0} biến thể.`,
            );
            resetState();
            onOpenChange(false);
            onSuccess();
        } catch(error) {
            const importErrors = getImportErrors(error);

            if(importErrors.length > 0) {
                setErrors(importErrors);
                toast.error("File Excel có dữ liệu không hợp lệ.");
            } else {
                toast.error(getErrorMessage(error));
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if(!nextOpen) resetState();
                onOpenChange(nextOpen);
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Nhập sản phẩm từ Excel</DialogTitle>
                    <DialogDescription>
                        Mỗi dòng trong file Excel là một biến thể sản phẩm.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed p-4 hover:bg-muted/50">
                        <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                                {file ? file.name : "Chọn file .xlsx hoặc .xls"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {file ? `${Math.round(file.size / 1024)} KB` : "File import"}
                            </p>
                        </div>
                        <Input
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            onChange={(event) => {
                                setFile(event.target.files?.[0] ?? null);
                                setErrors([]);
                            }}
                        />
                    </label>

                    {errors.length > 0 ? (
                        <div className="max-h-56 overflow-auto rounded-md border border-destructive/30 bg-destructive/5 p-3">
                            <p className="mb-2 text-sm font-medium text-destructive">
                                Có {errors.length} lỗi cần sửa
                            </p>
                            <ul className="space-y-1 text-sm text-destructive">
                                {errors.map((item, index) => (
                                    <li key={`${item.row}-${item.field}-${index}`}>
                                        Dòng {item.row} - {item.field}: {item.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
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
                        type="button"
                        loading={loading}
                        loadingText="Đang nhập..."
                        disabled={!file}
                        onClick={handleSubmit}
                    >
                        Nhập Excel
                    </SpinnerButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
